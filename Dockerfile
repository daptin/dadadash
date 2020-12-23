FROM daptin/daptin:travis

RUN mkdir -p /opt/daptin/storage/documents
ADD dist/spa /opt/daptin/dashboard
ENV DAPTIN_DASHBOARD /opt/daptin/dashboard
ENV DAPTIN_PORT_VARIABLE PORT

CMD /opt/daptin/daptin -dashboard /opt/daptin/dashboard -port :8080
