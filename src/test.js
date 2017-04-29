const { expect } = require('chai');

const {
    createDependencyGraph,
    createInstallation,
    depend,
    getDependencies,
    install,
    list,
    remove,
} = require('./package_manager');

(function testAddDependencies() {
    let graph = createDependencyGraph();
    graph = depend(graph, 'TELNET', ['TCPIP', 'NETCARD']);
    graph = depend(graph, 'TELNET', ['OTHER']);

    const deps = getDependencies(graph, 'TELNET');

    expect(deps.includes('TCPIP')).to.be.true;
    expect(deps.includes('NETCARD')).to.be.true;
    expect(deps.includes('OTHER')).to.be.true;
})();

(function testInstallation() {
    let graph = createDependencyGraph();
    graph = depend(graph, 'TELNET', ['TCPIP', 'NETCARD']);
    graph = depend(graph, 'TCPIP', ['NETCARD']);
    graph = depend(graph, 'BROWSER', ['TCPIP', 'HTML']);

    let installation = createInstallation();
    installation = install(installation, graph, 'TELNET');
    expect(installation.getIn(['referenceCounter', 'TCPIP'])).to.be.equal(1);
    installation = install(installation, graph, 'BROWSER');
    expect(installation.getIn(['referenceCounter', 'TCPIP'])).to.be.equal(2);
})();

(function testRemove() {
    let graph = createDependencyGraph();
    graph = depend(graph, 'TELNET', ['TCPIP', 'NETCARD']);
    graph = depend(graph, 'TCPIP', ['NETCARD']);
    graph = depend(graph, 'BROWSER', ['TCPIP', 'HTML']);

    let installation = createInstallation();
    installation = install(installation, graph, 'TELNET');
    installation = install(installation, graph, 'BROWSER');

    installation = remove(installation, graph, 'TELNET');
    expect(installation.getIn(['installed']).toJS().length).to.be.equal(1);
    expect(installation.getIn(['referenceCounter', 'TCPIP'])).to.be.equal(1);
    installation = remove(installation, graph, 'BROWSER');
    expect(installation.getIn(['installed']).toJS().length).to.be.equal(0);
    expect(installation.getIn(['referenceCounter', 'TCPIP'])).to.be.equal(0);
})();

(function testList() {
    let graph = createDependencyGraph();
    graph = depend(graph, 'TELNET', ['TCPIP', 'NETCARD']);
    graph = depend(graph, 'TCPIP', ['NETCARD']);
    graph = depend(graph, 'BROWSER', ['TCPIP', 'HTML']);

    let installation = createInstallation();
    installation = install(installation, graph, 'TELNET');
    installation = install(installation, graph, 'BROWSER');

    expect(list(installation).size).to.be.equal(5);
})();

process.exit();
