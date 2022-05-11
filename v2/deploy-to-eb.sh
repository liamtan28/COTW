#http://cotw-env.eba-dgxmbt4i.ap-southeast-2.elasticbeanstalk.com/

aws elasticbeanstalk create-application-version --application-name "Your Web App" --version-label $APP_VERSION --source-bundle S3Bucket=$S3_BUCKET,S3Key=Dockerrun.aws.json

aws elasticbeanstalk update-environment --application-name "Your Web App" --environment-name "your-web-app-production" --version-label=$APP_VERSION


# 