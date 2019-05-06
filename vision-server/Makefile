DOCKER = sudo docker
APT_GET = sudo apt-get

BASE_PATH = /Users/isobar/github2/listerine-2019/vision-server/
DEV_CONTAINER_TAG = 2.0.0
CONTAINER_TAG = 1.9.2
CONTAINER_VOLUME = /home/listerine-2019/vision-server/public
HOST_VOLUME = /home/cphuang72/public
GCS_BUCKET = listerine-2019
EXT_IP = 34.80.23.177
INT_IP = 10.140.0.2
CPU_CORES = 2
MOBILE = 0
ALPHA_BLEND = 2.0
BRIGHTNESS = 1.2
SATURATION = 1.1
MOB_BRIGHTNESS = 1.2
MOB_SATURATION = 1.0
DOCKER_IMAGE_NAME = isobar/docker-python-nodejs-opencv-dlib-vision
GCR_IMAGE_NAME = asia.gcr.io/isobar-gcp-test-jacky-huang/isobar-vision-server

default: show

clean:
		@echo
		@echo "delete files"
		rm -rf public/upload/*
		rm -rf public/result/*
		rm -rf ./*.jpg ./*.png

show:
		@echo
		@echo "Show me photos"
		open face.jpg output.jpg before.jpg after.jpg

distclean:
		@echo
		@echo "delete dist files"
		rm -rf exports
		mkdir exports

archive: distclean
		@echo
		@echo "Export repository"
		git archive --format zip -o exports/vision-server.zip master
		cp -pRP sh exports/
		cp db.json exports/
		cp .env exports/
		cp $(BASE_PATH)TeethWhitening/teeth-whitening.py exports/

update:
		@echo
		@echo "Install packages for ubuntu 16.04"
		@echo "make install"
		$(APT_GET) update
		$(APT_GET) install build-essential cmake pkg-config
		$(APT_GET) install python-pip

pyenv:
		@echo
		@echo "Installing my python environments"
		sudo pip install virtualenv virtualenvwrapper
		mkdir ${HOME}/.virtualenvs
		@echo "add this in .bashrc"
		@echo "export WORKON_HOME=${HOME}/.virtualenvs"
		@echo "source /usr/local/bin/virtualenvwrapper.sh"
		@echo "export WORKON_HOME=${HOME}/.virtualenvs" >> ~/.bashrc
		@echo "source /usr/local/bin/virtualenvwrapper.sh" >> ~/.bashrc
		@echo "mkvirtualenv py2 -p python2"
		@echo "mkvirtualenv py3 -p python3"
		@wcho "workon py2"

pypkg:
		@echo
		@echo "Installing python packages"
		pip install numpy Pillow scipy scikit-image IsobarImg

opencv:
		@echo
		@echo "Installing opencv"
		$(APT_GET) install libsm6 libxrender1
		pip install 'opencv-contrib-python-headless<4.0'
		pip install ipython

dlib:
		@echo
		@echo "Installing dlib"
		git clone https://github.com/davisking/dlib.git
		cd dlib/examples
		mkdir build
		cd build
		cmake ..
		cmake --build . --config Release
		cd ../../
		python setup.py install

node:
		@echo
		@echo "Installing nodejs"
		curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
		$(APT_GET) install -y nodejs
		@echo "node: `node -v`	npm: `npm -v`"

forever:
		@echo
		@echo "Installing forever"
		sudo npm install forever -g

app:
		@echo
		@echo "Install vision server"
		sudo npm install
		mkdir -p public/upload public/result public/images

start:
		gcsfuse --key-file /user/local/etc/gcs-key.json $(GCS_BUCKET) $(CONTAINER_VOLUME)
		npm start

#autossh:
#		@echo
#		@echo "Installing autossh"
#		sudo cp bin/autossh.sh /usr/local/bin/

#install: update pyenv opencv dlib node forever pypkg app
		@echo
		@echo "Setup crontab"
		@echo "Download a trained facial shape predictor:\nwget http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2"

dk-build:
		@echo
		@echo "Build a docker image"
		$(DOCKER) image build -t $(DOCKER_IMAGE_NAME):$(CONTAINER_TAG) -f Dockerfile-py2-nodejs-opencv-dlib-vision .

dk-dev-build:
		@echo
		@echo "Build a docker image"
		$(DOCKER) image build -t $(DOCKER_IMAGE_NAME):$(DEV_CONTAINER_TAG) -f Dockerfile-py2-nodejs-opencv-dlib-fuse-vision .

dk-fuse-build:
		@echo
		@echo "Build a docker image"
		$(DOCKER) image build -t isobar/docker-python-nodejs-opencv-dlib-fuse:$(DEV_CONTAINER_TAG) -f Dockerfile-py2-nodejs-opencv-dlib-fuse .

dk-save:
		@echo
		@echo "Save a docker image"
		$(DOCKER) save -o isobar-docker-image.$(CONTAINER_TAG).tar $(DOCKER_IMAGE_NAME):$(CONTAINER_TAG)

dk-load:
		@echo
		@echo "Load a docker image"
		$(DOCKER) load -i docker-images/isobar-docker-image.$(CONTAINER_TAG).tar

dk-tag-push: dk-gcr-tag dk-push

dk-push:
		@echo
		@echo push a stable image to google container registry
		sudo gcloud docker -- push $(GCR_IMAGE_NAME):$(CONTAINER_TAG)

dk-dev-push:
		@echo
		@echo push a dev image to google container registry
		sudo gcloud docker -- push $(GCR_IMAGE_NAME):$(DEV_CONTAINER_TAG)

dk-gcr-tag:
		@echo
		@echo "Create a tag for gcr.io"
		$(DOCKER) tag $(DOCKER_IMAGE_NAME):$(CONTAINER_TAG) $(GCR_IMAGE_NAME):$(CONTAINER_TAG)

dk-run:
		@echo
		@echo "Run a container"
		$(DOCKER) run --name isobar-outdoor -p 8080:8080 $(DOCKER_IMAGE_NAME):$(CONTAINER_TAG)

dk-run-pub:
		@echo
		@echo "Run a container with a public folder"
		$(DOCKER) run --rm --name isobar-pub -e EXT_IP=$(EXT_IP) -e INT_IP=$(INT_IP) -e ALPHA_BLEND=$(ALPHA_BLEND) -e MOBILE=$(MOBILE) -p 8080:8080 -v $(HOST_VOLUME):$(CONTAINER_VOLUME) $(DOCKER_IMAGE_NAME):$(CONTAINER_TAG)

dk-run-kiosk:
		@echo
		@echo "Run a container for kiosk"
		$(DOCKER) run --rm --name isobar-kiosk -e EXT_IP=$(EXT_IP) -e INT_IP=$(INT_IP) -e ALPHA_BLEND=$(ALPHA_BLEND) -e MOBILE=0 -e BRIGHTNESS=$(BRIGHTNESS) -e SATURATION=$(SATURATION) -p 8080:8080 -v $(HOST_VOLUME):$(CONTAINER_VOLUME) $(DOCKER_IMAGE_NAME):$(CONTAINER_TAG)

dk-run-mob:
		@echo
		@echo "Run a container for mobile"
		$(DOCKER) run --rm --name isobar-mobile -e EXT_IP=$(EXT_IP) -e INT_IP=$(INT_IP) -e ALPHA_BLEND=$(ALPHA_BLEND) -e MOBILE=1 -e BRIGHTNESS=$(MOB_BRIGHTNESS) -e SATURATION=$(MOB_SATURATION) -p 8081:8080 -v $(HOST_VOLUME):$(CONTAINER_VOLUME) $(DOCKER_IMAGE_NAME):$(CONTAINER_TAG)

dk-run-dev:
		@echo
		@echo "Run a dev container with gcsfuse"
		$(DOCKER) run --rm --privileged --name isobar-mobile-dev -p 8080:8080 -v /home/cphuang72/isobar-6aaa0f4b98f1.json:/user/local/etc/gcs-key.json $(DOCKER_IMAGE_NAME):$(DEV_CONTAINER_TAG)

dk-run-gcr:
		@echo
		@echo "Run a container on gcr"
		mkdir -p /home/cphuang72/public
		$(DOCKER) run -d --rm --name isobar-gcr -e EXT_IP=$(EXT_IP) -e INT_IP=$(INT_IP) -e ALPHA_BLEND=$(ALPHA_BLEND) -e CORES=$(CPU_CORES) -p 8080:8080 -v $(HOST_VOLUME):$(CONTAINER_VOLUME) $(GCR_IMAGE_NAME):$(CONTAINER_TAG)


dk-bash:
		@echo
		@echo "Run a bash command"
		$(DOCKER) exec -it $(CID) bash

