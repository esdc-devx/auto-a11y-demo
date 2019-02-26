# Automated Accessibilty (A11y) Demo

This project is a test of puppeteer and aXe.
We are using the ROEWeb Demo site due to the non-production nature of it, and the fact that it's testable.

## Requirements

NodeJS

Run the following commands to set the environment variables needed for running the demo.

You will need to setup an account with GCKey.

```bash
export ROEWEB_UNAME= #Enter in your GCKey Username here
export ROEWEB_PWORD= #Enter in your GCKey Password Here
export ROEWEB_ORGID= #Enter your ROE Web Demo Orgganization here
```

Run `npm i ` to install node modules

Run `npm start`  to run the test

## Security Considerations
Security considerations for running this script.

### Credentials
Don't check your credentials into source control, this is very bad.
Either enter in the commands manually, or put them in a file named `secrets.sh` this is ignored in the `.gitignore file`
