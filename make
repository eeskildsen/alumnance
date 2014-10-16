#!/bin/sh

# Builds Alumnance, then zips it and uploads it to ericeskildsen.com, replacing the old version there

grunt build
tar -czf alumnance.tar.gz build/public
scp -P 2222 alumnance.tar.gz eeskil01@ericeskildsen.com:~/alumnance.tar.gz
ssh -p 2222 eeskil01@ericeskildsen.com "~/alumnance_update"
