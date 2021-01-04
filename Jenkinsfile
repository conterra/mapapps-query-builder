#!/usr/bin/env groovy
def releaseParams = [:];
def buildParams = [:];

def testStageWasExecute = false;

def updateVersions(targetversion,pushChanges=false){
    echo "update versions in manifest.json files to ${targetversion}"
    sh "mvn validate -P write-release-versions -Dreplace.target.version=${targetversion}"
    echo "update versions in pom.xml files to ${targetversion}"
    sh "mvn versions:set -DnewVersion=${targetversion} -DgenerateBackupPoms=false"
    sh "mvn scm:checkin -DpushChanges=${pushChanges} -Dmessage=\"[update-version] to ${targetversion}\""
}

pipeline {
    agent {
       label 'maven-java-8'
    }
    environment {
        GIT_NEXUS_ID = 'bitbucket-nexus-access'
        GITHUB_CREDENTIAL_ID = 'github-api-key'
        AKS_CRED_ID = 'aksCTPrdSrv'
    }
    options {
        buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '0', daysToKeepStr: '', numToKeepStr: '10'))
        disableConcurrentBuilds()
        timeout(time: 60, unit: 'MINUTES')
    }
    parameters {
        string(name: 'cause', defaultValue: 'manual', description: 'Who triggered this build?')
        booleanParam(name: 'release', defaultValue: false, description: 'Should a release be performed?')
        booleanParam(name: 'test', defaultValue: true, description: 'Should tests be performed?')
        booleanParam(name: 'build', defaultValue: true, description: 'Should a full build/compress be performed?')
    }
    stages {
        stage('Initialize'){
            steps {
                echo "Pipeline triggered because ${params.cause}"

                echo "Cleanup workspace"
                sh 'mvn clean -P release,compress,rollout'

                script{
                    buildParams  << params;
                    if (!buildParams.release){
                        return;
                    }
                    def project = readMavenPom();
                    def curversion = project.version.replace('-SNAPSHOT', '')
                    timeout(5) {
                        releaseParams = input message: "Choose Versions:", parameters: [
                            string(defaultValue: "${curversion}", description: 'The current release version', name: 'RELEASE_VERSION'),
                            string(defaultValue: "${curversion}", description: 'The next target version', name: 'NEXT_DEV_VERSION_RAW')]
                    }
                    if (releaseParams['RELEASE_VERSION'] == releaseParams['NEXT_DEV_VERSION_RAW']){
                        error "Release and new target version must be different!"
                    }
                    def rawDevVersion = releaseParams['NEXT_DEV_VERSION_RAW']
                    rawDevVersion = rawDevVersion.replace('-SNAPSHOT', '');
                    // Ensure that raw dev version has no snapshot post fix
                    releaseParams['NEXT_DEV_VERSION_RAW'] = rawDevVersion;
                    // ensure that next dev version has a snapshot post fix
                    releaseParams['NEXT_DEV_VERSION'] = rawDevVersion + "-SNAPSHOT";
                    // update display name
                    currentBuild.displayName = "${currentBuild.displayName} RELEASE ${releaseParams['RELEASE_VERSION']}"

                    echo "Update module versions ${releaseParams}"
                    withCredentials([usernamePassword(credentialsId: GITHUB_CREDENTIAL_ID, passwordVariable: 'GITHUB_USER_PW', usernameVariable: 'GITHUB_USER_NAME')]){
                        updateVersions(releaseParams['RELEASE_VERSION'],false);
                    }
                }
            }
        }
        stage('Test'){
            when { expression { return buildParams.test && !buildParams.release} }
            steps {
                echo "run java tests"
                // need to run install to have submodules ready for webapp jetty start
                sh "mvn install"
                echo "run js tests"
                sh "mvn prepare-package -P run-js-tests,include-mapapps-deps"

                script {
                    testStageWasExecute = true;
                }
            }
        }
        stage('Build') {
            when { expression { return buildParams.build || buildParams.release } }
            steps {
                echo "full build + js compress + nexus deploy"
                withCredentials([usernamePassword(credentialsId: GIT_NEXUS_ID, passwordVariable: 'USER_PW', usernameVariable: 'USER_NAME')]) {
                    sh 'mvn deploy -P compress -DdeployAtEnd=true -Dmaven.test.skip.exec=true -Dct-nexus.username=$USER_NAME -Dct-nexus.password=$USER_PW'
                }
            }
        }
        stage('Rollout') {
            when { expression { return buildParams.release } }
            steps {
                echo "create rollout"
                withCredentials([usernamePassword(credentialsId: GIT_NEXUS_ID, passwordVariable: 'USER_PW', usernameVariable: 'USER_NAME'),
                                 usernamePassword(credentialsId: GITHUB_CREDENTIAL_ID, passwordVariable: 'GITHUB_USER_PW', usernameVariable: 'GITHUB_USER_NAME')]){
                    sh "mvn deploy -P github-release -Dct-nexus.username=${USER_NAME} -Dct-nexus.password=${USER_PW} -Dusername=${GITHUB_USER_NAME} -Dpassword=${GITHUB_USER_PW}"
                }
            }
        }
        stage('Finalize') {
            steps {
                script {
                    if (!buildParams.release){
                        return;
                    }
                    echo "Update versions after release"
                    withCredentials([usernamePassword(credentialsId: GITHUB_CREDENTIAL_ID, passwordVariable: 'GITHUB_USER_PW', usernameVariable: 'GITHUB_USER_NAME')]){
                        updateVersions(releaseParams['NEXT_DEV_VERSION'],true);
                    }
                }
            }
            post {
                success{
                    echo "Cleanup workspace after build"
                    sh 'mvn clean -P release,compress,rollout'
                }
            }
        }
    }
}
