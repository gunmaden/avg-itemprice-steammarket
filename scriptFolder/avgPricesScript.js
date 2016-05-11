// ==UserScript==
// @name       SteamMarketplace Price Averager
// @version    1.0
// @description  Takes the average of the last 20 items sold of the current item
// @include      http://steamcommunity.com/market/*
// @require    http://code.jquery.com/jquery-latest.js
// @copyright  2016, Gunmaden
// ==/UserScript==
$(document).ready(function () {
    // Add table header
    $('#searchResults').find('.market_listing_table_header').first().children('.market_listing_right_cell').last().after('<div class="market_listing_right_cell" style="padding: 0 0.5em">AVG. PRICE</div>');
    $('#sellListings').find('.market_listing_table_header').first().children('.market_listing_right_cell').last().after('<div class="market_listing_right_cell" style="padding: 0 0.5em">AVG. PRICE</div>');
    var url = window.location.pathname;
    var pageType = getPageType(url);
    if (pageType == 'item') {
        var item = decodeURIComponent(url.split('/')[4]);
        new Ajax.Request('http://steamcommunity.com/market/pricehistory/', {
            method: 'get',
            parameters: {
                appid: getAppIDItem(url),
                market_hash_name: item
            },
            onSuccess: function (transport) {
                sumAverage(transport)
            },
            onFailure: function (transport) {
                failed()
            }
        });
    } else if (pageType == 'search') {
        // Get average price for each item
        $('#searchResults').find('.market_listing_item_name').each(function () {
            var item = $(this).text();
            var currItem = this;
            new Ajax.Request('http://steamcommunity.com/market/pricehistory/', {
                method: 'get',
                parameters: {
                    appid: getAppIDMulti(this),
                    market_hash_name: item
                },
                onSuccess: function (transport) {
                    sumAverage(transport, currItem, item)
                },
                onFailure: function (transport) {
                    failed(item)
                }
            });
        });
    } else {
        // Get average price for each item
        $('#sellListings').find('.market_listing_item_name').each(function () {
            var item = $(this).text();
            var currItem = this;
            new Ajax.Request('http://steamcommunity.com/market/pricehistory/', {
                method: 'get',
                parameters: {
                    appid: getAppIDMulti(this),
                    market_hash_name: item
                },
                onSuccess: function (transport) {
                    sumAverage(transport, currItem, item)
                },
                onFailure: function (transport) {
                    failed(item)
                }
            });
        });
    }
    function getPageType(url) {
        var splitURL = url.split('/');
        var pageType = splitURL[2];
        if (pageType == 'listings') {
            return 'item';
        } else if (pageType == 'search') {
            return 'search';
        } else {
            return 'main';
        }
    }

    function getAppIDMulti(elem) {
        var a = $(elem).parent().parent().parent().attr('href');
        var url = a.split('/');
        var appid = url[5];
        return appid;
    }

    function getAppIDItem(url) {
        var splitURL = url.split('/');
        var appid = splitURL[3];
        console.log(appid);
        return appid;
    }

    function failed() {
        console.log('Could not get price history for ' + item);
    }

    function sumAverage(transport, currItem, item) {
        // JSON
        var results = transport.responseText;
        // Print results - debugging
        //console.log(results);
        // Parse JSON
        var parsed = JSON.parse(results);
        // Store in array
        var arr = $.map(parsed, function (el) {
            return el;
        });
        // Number of sales
        // Variables
        var total = 0;
        var count = 20;
        for (var i = arr.length - 1; i >= arr.length - count; i--) {
            // Get sale price
            var val = arr[i][1];
            // Add to total
            total = total + val;
        }    // Calculate average

        var avg = parseFloat(total / count).toFixed(2);
        // Average output - debugging
        if (pageType == 'item') {
            // Show on page
            $('.item_desc_content').append('<div class="average_price" style="font-size: 1.2em"> Average price: <span style="font-size: 1.75em">' + avg + ' RUB </span></div>');
        } else {
            // Show on page
            $(currItem).parent().parent().children('.market_listing_right_cell').last().after('<div class="market_listing_right_cell average_price" style="text-align: center; width: 80px"><span class="market_table_value" style="padding: 0 0.5em">$' + avg + '</span></span></div>');
        }
    }
});
