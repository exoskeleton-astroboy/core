SUBDIRS = configs middlewares app
.PHONY: subdirs $(SUBDIRS)
subdirs: $(SUBDIRS)

build:
	rm -rf dist
	npx tsc
	cp CHANGELOG.md dist
	cp README.md dist

rc: build
	TS_NODE_PROJECT=tsconfig.build.json npx ts-node ./scripts/publish.rc.ts

publish: build
	TS_NODE_PROJECT=tsconfig.build.json npx ts-node ./scripts/publish.ts
