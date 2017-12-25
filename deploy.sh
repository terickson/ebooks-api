#Docker build and publish
BUILD_NUMBER=`date +%s`
DOCKER_IMAGE="mordor.home:5000/ebooks-api:$BUILD_NUMBER"
docker build -t ebooks-api .
compileStatus=$?
if [ $compileStatus -eq 1 ]; then
  echo "Build failed please review the log"
  exit 1
fi
docker tag ebooks-api $DOCKER_IMAGE
docker push $DOCKER_IMAGE

#Kubernetes redeploy

SetupNeeded=0
if ssh terickson@mordor.home "/home/terickson/bin/kubectl get pod | grep -q \"ebooks-api\""; then
    SetupNeeded=-1
fi
if [ $SetupNeeded = 0 ]; then
	  scp deploy.yaml terickson@mordor.home:
    ssh terickson@mordor.home "/home/terickson/bin/kubectl create -f deploy.yaml"
    sleep 5
fi
ssh terickson@mordor.home "/home/terickson/bin/kubectl set image deploy/ebooks-api ebooks-api=$DOCKER_IMAGE"
