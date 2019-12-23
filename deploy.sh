#!/bin/sh
LAST_COMMIT=$(git log -1 --pretty=format:'%h %an %s')
echo "Deploying changes from $LAST_COMMIT"
firebase deploy -m "Updates from $LAST_COMMIT"
