# Build image locally
docker build -t nginx-cotw .
# tag locally built image
docker tag nginx-cotw:latest 353914335363.dkr.ecr.ap-southeast-2.amazonaws.com/cotw:latest
# push to ECR
docker push 353914335363.dkr.ecr.ap-southeast-2.amazonaws.com/cotw:latest
