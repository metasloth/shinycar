.PHONY: pkg buildui

.PHONY: clean
clean:
	@echo "Removing build artifacts"
	@rm -f *.tsbuildinfo
	@rm -rf dist

.PHONY: init
init:
	@echo "Installing node dependancies"
	npm i
	cd web && npm i
	@echo "Local dependancies installed."

pack:
	# Build custom Run image
	docker build -t shinycar_cloud_run -f run.Dockerfile .
	pack build shinycar_service --builder gcr.io/buildpacks/builder:v1 --run-image shinycar_cloud_run

.PHONY: local
local:
	pack build --builder=gcr.io/buildpacks/builder shinycar
	docker run -it -ePORT=8080 -p8080:8080 shinycar

###
### === Backend ===
###

.PHONY: devbe
# Start the backend service with nodemon rebuilds.
devbe:
	npm run dev

###
### === Frontend ===
###

.PHONY: devui
# Start the frontend live server.
devui:
	cd web && npm run start

.PHONY: buildui
# Build the frontend for static hosting
buildui:
	cd web && npm run build
