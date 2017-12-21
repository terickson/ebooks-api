#! /bin/sh

# define hosts to deploy to

case $1 in
	-dev)
		hosts=("app-host-1_dev.wwtatc.local")
		;;
	-test)
		hosts=("app-host-1_test.wwtatc.local")
		;;
	-prod)
		hosts=("app-host-1_prod.wwtatc.local")
		;;
	*)
		echo "please run with $0 -dev or $0 -test or $0 -prod"
		exit 1
esac

for i in ${hosts[@]}; do
	npm run compile
        compileStatus=$?
        if [ $compileStatus -eq 1 ]; then
                echo "Build failed please review the log"
                exit 1
        fi
	scp -r release root@${i}:/var/atc/ebooks-api/
	scp package.json root@${i}:/var/atc/ebooks-api/
	scp endpoints.json root@${i}:/var/atc/ebooks-api/
	scp gitInfo.json root@${i}:/var/atc/ebooks-api/
	ssh root@${i} "nvm use 8; cd /var/atc/ebooks-api; /root/.nvm/versions/node/v8.9.0/bin/npm install --production;"
	scp monit.d/* root@${i}:/etc/monit.d/
	ssh root@${i} "service ebooks-api stop"
	scp init.d/* root@${i}:/etc/init.d/
	ssh root@${i} "/sbin/chkconfig ebooks-api on"
	ssh root@${i} "rm -f /var/atc/ebooks-api/pid/app.pid"
	ssh root@${i} "service ebooks-api start"
	ssh root@${i} "service monit reload"
done
