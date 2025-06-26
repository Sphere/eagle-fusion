node() {
    try {
        String ANSI_GREEN = "\u001B[32m"
        String ANSI_NORMAL = "\u001B[0m"
        String ANSI_BOLD = "\u001B[1m"
        String ANSI_RED = "\u001B[31m"
        String ANSI_YELLOW = "\u001B[33m"

        ansiColor('xterm') {
            stage('Checkout') {
                cleanWs()
                checkout scm
                }
        }

           stage('docker-build') {
                sh '''
                   commit_id=$(git rev-parse --short HEAD)
                   echo $commit_id> commit_id.txt
                   cd $docker_file_path
                   pwd
                   docker build -t $docker_server/$docker_repo:$commit_id .
                   docker tag $docker_server/$docker_repo:$commit_id $docker_server/$docker_repo:$image_tag
                   echo "docker build is completed !!!! Starting docker push"
                   '''
        }

         stage('docker-push') {

               sh '''
                  pwd
                  commit_id=$(git rev-parse --short HEAD)
                  docker push $docker_server/$docker_repo:$commit_id
                  docker push $docker_server/$docker_repo:$image_tag
                  docker rmi -f $docker_server/$docker_repo:$commit_id
                  docker rmi -f $docker_server/$docker_repo:$image_tag
                  '''

}


}
    catch (err) {
        currentBuild.result = "FAILURE"
        throw err
    }

}
