# Automated Accessibilty (A11y) Demo

This project is a test of puppeteer and aXe.

## Requirements

NodeJS

Run the following commands to set the environment variables needed for running the demo.

You will need to setup an account with GCKey.

```bash
# GCKey Username
export ROEWEB_UNAME=<<USER_NAME>>
# GCKey Password
export ROEWEB_PWORD=<<PASSWORD>>

```

Run `npm i ` to install node modules

Run `npm start`  to run the test

## Security Considerations
Security considerations for running this script.

### Credentials
Don't check your credentials into source control, this is very bad.
Either enter in the commands manually, or put them in a file named `secrets.sh` this is ignored in the `.gitignore file`
