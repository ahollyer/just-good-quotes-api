from fabric.api import run, env, sudo, cd, prefix, shell_env

env.hosts = ['34.225.89.135']
env.user = 'aspen'

DIR = '/home/aspen/just-good-quotes-api'
VENV = 'postgres://postgres@localhost:5432/Quotes' # secrets to be sourced

def start ():
  with cd(DIR):
    with shell_env(PATH='/home/aspen/.nvm/versions/node/v6.10.2/bin:$PATH'):
      with shell_env(DATABASE=VENV):
        run('pm2 start backend.js > start.log')

def stop ():
  run('pm2 stop all > stop.log')

def deploy ():
  with cd(DIR):
    run('git pull')

    with shell_env(PATH='/home/aspen/.nvm/versions/node/v6.10.2/bin:$PATH'):
      with shell_env(DATABASE=VENV):
        run('npm install  > install.log')
        run('pm2 restart all > restart.log')

def hello ():
  print("Hello")
