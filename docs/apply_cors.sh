#!/bin/bash

aws \
	--endpoint https://s3.filebase.com \
	--profile filebase s3api put-bucket-cors \
	--bucket audio-c0253ca5 \
	--cors-configuration=file://corspolicy.json