BUILD=./lib

$(BUILD)/index.js:	es6.js
	mkdir -p $(BUILD) && \
	cat ./node_modules/regenerator/runtime/min.js >$@ && \
	./node_modules/regenerator/bin/regenerator $^ >>$@
