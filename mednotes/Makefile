.PHONY: typescript-sdk
typescript-sdk:
	python frontend/dump_openapi.py > frontend/openapi.yml
	./frontend/codegen.sh frontend/openapi.yml frontend/src/generated_client
	-rm frontend/openapi.yml