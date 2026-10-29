"""SMS delivery. Provider chosen with SMS_PROVIDER: console | msg91 | twilio.

Indian operators require DLT registration of the sender ID and template; MSG91 handles this
through its template id. Check your provider's current API documentation before going live.
"""
import base64
import json
import logging
import urllib.parse
import urllib.request
from .. import config

log = logging.getLogger("adivasisetu.sms")


class SmsError(Exception):
    pass


def _post(url, data=None, json_body=None, headers=None):
    headers = dict(headers or {})
    if json_body is not None:
        data = json.dumps(json_body).encode()
        headers["Content-Type"] = "application/json"
    elif data is not None:
        data = urllib.parse.urlencode(data).encode()
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.status, r.read().decode()
    except Exception as e:  # network errors, HTTP errors
        raise SmsError(str(e)) from e


def send_otp(phone: str, otp: str) -> None:
    provider = config.SMS_PROVIDER
    if provider == "console":
        log.warning("OTP for %s is %s (SMS_PROVIDER=console)", phone, otp)
        return
    if provider == "msg91":
        if not (config.MSG91_AUTH_KEY and config.MSG91_TEMPLATE_ID):
            raise SmsError("MSG91 is not configured")
        qs = urllib.parse.urlencode({"template_id": config.MSG91_TEMPLATE_ID, "mobile": f"91{phone}",
                                     "authkey": config.MSG91_AUTH_KEY, "otp": otp})
        _post(f"https://control.msg91.com/api/v5/otp?{qs}", json_body={})
        return
    if provider == "twilio":
        if not (config.TWILIO_SID and config.TWILIO_TOKEN and config.TWILIO_FROM):
            raise SmsError("Twilio is not configured")
        auth = base64.b64encode(f"{config.TWILIO_SID}:{config.TWILIO_TOKEN}".encode()).decode()
        _post(f"https://api.twilio.com/2010-04-01/Accounts/{config.TWILIO_SID}/Messages.json",
              data={"To": f"+91{phone}", "From": config.TWILIO_FROM,
                    "Body": f"Your AdivasiSetu OTP is {otp}. It is valid for {config.OTP_TTL_SECONDS // 60} minutes."},
              headers={"Authorization": f"Basic {auth}"})
        return
    raise SmsError(f"Unknown SMS_PROVIDER '{provider}'")
