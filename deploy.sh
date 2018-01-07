#Docker build
BUILD_NUMBER=`date +%s`
SERVICE_NAME="ebooks-api"
DOCKER_IMAGE="mordor.home:5000/$SERVICE_NAME:$BUILD_NUMBER"
DOCKER_IMAGE_SED="mordor.home:5000\\/$SERVICE_NAME:$BUILD_NUMBER"
docker build -t $SERVICE_NAME .
compileStatus=$?
if [ $compileStatus -eq 1 ]; then
  echo "Build failed please review the log"
  exit 1
fi

#Docker Publish
docker tag $SERVICE_NAME $DOCKER_IMAGE
docker push $DOCKER_IMAGE

#setup deployment yaml in deployment directory
scp deploy.yaml terickson@mordor.home:deployments/$SERVICE_NAME.yaml
ssh terickson@mordor.home "sed -i -- 's/<<image>>/$DOCKER_IMAGE_SED/g' deployments/$SERVICE_NAME.yaml"

#Kubernetes deploy
ssh terickson@mordor.home "/home/terickson/bin/kubectl apply -f deployments/$SERVICE_NAME.yaml"
