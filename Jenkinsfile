@Library('piper-lib@master_fe_1.272.0') _

call script: this

void call(parameters) {
    pipeline {
        agent any
        options {
            timeout(time: 120, unit: 'MINUTES')
            timestamps()
            buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '20'))
            skipDefaultCheckout()
            disableConcurrentBuilds()
        }
        stages {
            stage('Init') {
                steps {
                    withCredentials([usernameColonPassword(credentialsId: 'mavenlogin', variable: 'MAVENLOGIN')]) {
                        sh '''
                        bash
                        curl -x 10.4.103.139:8080 -U "${MAVENLOGIN}" https://repo.maven.apache.org/maven2
                        sudo docker login -u orastark -p ${DOCKERLOGIN}
                  		'''
                    }
                    piperPipelineStageInit script: parameters.script, customDefaults: ['com.sap.piper/pipeline/stageOrdinals.yml'].plus(parameters.customDefaults ?: [])
                }
            }
            // stage('Pull-Request Voting') {
            //     steps {
            //         piperPipelineStagePRVoting script: parameters.script
            //     }
            // }
            stage('Build') {
                steps {
                    piperPipelineStageBuild script: parameters.script
                }
            }
            // stage("Quality Gate") {
            //     steps {
            //         waitForQualityGate abortPipeline: true
            //     }
            // }
            stage('Release') {
                when{
                    anyOf{
                        expression{env.BRANCH_NAME == 'develop'}
                    }
                }
                steps {
                    piperPipelineStageRelease script: parameters.script
                }
            }
        }
        post {
            success {buildSetResult(currentBuild)}
            aborted {buildSetResult(currentBuild, 'ABORTED')}
            failure {buildSetResult(currentBuild, 'FAILURE')}
            unstable {buildSetResult(currentBuild, 'UNSTABLE')}
            cleanup {
                piperPipelineStagePost script: parameters.script
            }
        }
    }
}