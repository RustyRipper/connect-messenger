#!/bin/bash

# Replace the placeholders with actual environment variable values
envsubst < /usr/share/nginx/html/index.html > /tmp/index.html
mv /tmp/index.html /usr/share/nginx/html/index.html

# Start Nginx
nginx -g 'daemon off;'
