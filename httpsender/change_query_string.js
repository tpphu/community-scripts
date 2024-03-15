// The sendingRequest and responseReceived functions will be called for all requests/responses sent/received by ZAP, 
var Hasher = Java.type("org.zaproxy.addon.encoder.processors.predefined.HashProcessor");

function sendingRequest(msg, initiator, helper) {
	// Debugging can be done using println like this
	var uri = msg.getRequestHeader().getURI();
    var queryString = uri.getQuery()
    var queryParams = parseQueryString(queryString);
    
    var secret = "86bc21d0eb73ff06be46d078e8dbe2db"
    var hashString = [
        queryParams.terminalCode,
        queryParams.merchantCode,
        queryParams.paymentRequestId ? queryParams.paymentRequestId : "",
        queryParams.orderCode ? queryParams.orderCode : "",
        ].join("|")
    hashString= secret+hashString
    var checksum = new Hasher("sha256").process(hashString).getResult();

    print("checksum: " + checksum);
    // Set checksum
    queryParams.checksum = checksum;
    var newQueryString = buildQueryString(queryParams)
    print("newQueryString: " + checksum);
    msg.getRequestHeader().getURI().setQuery(newQueryString);
    
    return true;
}

function parseQueryString(queryString) {
    var params = {};
    // Phân chia chuỗi query string thành các cặp key-value
    var queries = queryString.split("&");
    queries.forEach(function(query) {
        var pair = query.split('=');
        if (pair[0] && pair[1]) {
            params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1].replace(/\+/g, " "));
        }
    });
    return params;
}

function parseQueryString(queryString) {
    var params = {};
    // Phân chia chuỗi query string thành các cặp key-value
    var queries = queryString.split("&");
    queries.forEach(function(query) {
        var pair = query.split('=');
        if (pair[0] && pair[1]) {
            params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1].replace(/\+/g, " "));
        }
    });
    return params;
}

function buildQueryString(params) {
    return Object.keys(params).map(function(key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');
}

function parseQueryString(queryString) {
    var params = {};
    // Phân chia chuỗi query string thành các cặp key-value
    var queries = queryString.split("&");
    queries.forEach(function(query) {
        var pair = query.split('=');
        if (pair[0] && pair[1]) {
            params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1].replace(/\+/g, " "));
        }
    });
    return params;
}

function responseReceived(msg, initiator, helper) {
	// Debugging can be done using println like this
	print('responseReceived called for url=' + msg.getRequestHeader().getURI().toString())
}