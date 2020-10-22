FROM daptin/daptin

ADD dist/spa /opt/daptin/dashboard
ENV DAPTIN_DASHBOARD /opt/daptin/dashboard
ENV DAPTIN_PORT 8080

