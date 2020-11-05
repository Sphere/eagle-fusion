#!/bin/bash

docker build -t eagle-docker.tarento.com/ui-static:gold .

echo "docker build is completed !!!! Starting docker push"

docker push eagle-docker.tarento.com/ui-static:gold .

