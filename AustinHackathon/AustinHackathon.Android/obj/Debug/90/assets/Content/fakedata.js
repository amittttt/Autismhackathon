var fakedata = function () {
    var fd = {};
    /*
     * Generate random number between a given minimum and maximum, for fake data.
     * @return Int random
     */
    fd.getRandomInt = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    };
    /*
     * Add 1 minute to given datetime, for fake data.
     * @return {DATE} date
     */
    fd.addMinutes = function (date, minutes = 1) {
        return new Date(date.getTime() + minutes * 60000);
    };
    /*
     * Generate fake data to populate & test graphs.
     * @return {Object} data
     */
    fd.generateFakeData = function (type) {
        var data = {},
            options = {
                countries: ['us', 'ca'],
                pieLabels: ['CreditCard', 'DellPreferredAccountNew', 'DellAdvantageRewards', 'PayPal', 'DellBusinessCreditPayCodeNewUpper', 'GiftCard'],
                pieColors: ['#65A637','#F7BC38', '#D93F3C', '#6E2585', '#EE6411', '#B7295A', '#0076CE', '#6EA204', '#F2AF00', '#41B6E6', '#CE1126', '#00447C', '#444444'],
                funnelLabels: ['Landing', 'Shipping', 'Payments', 'Review', 'Thank You', 'Something Else'],
                salesTableLabels: ['All Order Submissions', 'Orders on Fraud Hold', 'Confirmed Fraud Orders', 'Other Cancellations', 'Net Order Submissions'],
                speedTableLabels: ['Product Details asdhfkwjhe afslfj', 'Category aw98f98423hta asld ashfwlwe', 'Deals asldkf asldfe awfrwur asldflwe asdlhfw asdf3wh4 asdhfwhf awehii34']
            },
            now = new Date();
        now = fd.addMinutes(now, -45);
        if (type === 1) {
            data.GraphType = 1;
            data.GraphTitle = 'P20';
            data.GraphTitleLabel = '';
            data.GraphY1AxisLabel = 'hits';
            data.GraphY2AxisLabel = 'ms';
            data.GraphNumber = 50;
            data.GraphNumberLabel = '90<sup>th</sup>% ms';
            data.GraphLink = 'http://google.com';
			data.Interactive = 1;
            data.FiltersApplied = -1;
            data.Results = [];
            data.Results[0] = { SubResults: [] };
            for (var i = 0; i < 30; i++) {
                now = fd.addMinutes(now);
                data.Results[0].SubResults.push({
                    Timestamp: now.toString(),
                    Line1Value: fd.getRandomInt(100, 2000),
                    StackedBar1Value: fd.getRandomInt(100, 5000),
                    StackedBar2Value: fd.getRandomInt(100, 5000),
                    StackedBar3Value: fd.getRandomInt(100, 5000),
                    StackedBar4Value: fd.getRandomInt(100, 5000)
                });
                data.Results[0].SubResults[i].StackedBarTotal = (data.Results[0].SubResults[i].StackedBar1Value + data.Results[0].SubResults[i].StackedBar2Value + data.Results[0].SubResults[i].StackedBar3Value + data.Results[0].SubResults[i].StackedBar4Value);
            }
        } else if (type === 2) {
            data.GraphType = 2;
            //data.GraphLink = 'http://google.com';
            data.GraphLink = 'file:///android_asset/Login/index.html';
            data.GraphColor = '#CE1126'
            data.GraphTitle = 'Accessories failure';
            data.GraphNumber = 27;
            data.GraphY1AxisLabel = 'errors';
			data.Interactive = 0;
            data.FiltersApplied = -1;
            data.Results = [];
            data.Results[0] = { SubResults: [] };
            for (var i = 0; i < 24; i++) {
                now = fd.addMinutes(now);
                data.Results[0].SubResults.push({
                    Timestamp: now.toString(),
                    BarGraphValue: fd.getRandomInt(0, 100)
                });
            }
        } else if (type === 3) {
            data.GraphType = 3;
            data.GraphTitle = 'multi line example';
            data.GraphY1AxisLabel = 'units';
            data.GraphLegend = ['something', 'another', 'blah', 'yes'];
			data.Interactive = 2;
            data.FiltersApplied = -1;
            data.Results = [];
            data.Results[0] = { SubResults: [] };
            for (var i = 0; i < 24; i++) {
                now = fd.addMinutes(now);
                data.Results[0].SubResults.push({
                    Timestamp: now.toString(),
                    Line1Value: fd.getRandomInt(0, 100),
                    Line2Value: fd.getRandomInt(0, 20),
                    Line3Value: fd.getRandomInt(40, 60),
                    Line4Value: fd.getRandomInt(60, 100)
                });
            }
		} else if (type === 30) {
            data.GraphType = 3;
            data.GraphTitle = 'line example';
            data.GraphY1AxisLabel = 'units';
            data.GraphLegend = ['eagles sold'];
			data.Interactive = 0;
            data.Results = [];
            data.Results[0] = { SubResults: [] };
            for (var i = 0; i < 24; i++) {
                now = fd.addMinutes(now);
                data.Results[0].SubResults.push({
                    Timestamp: now.toString(),
                    Line1Value: fd.getRandomInt(0, 100)
                });
            }
        } else if (type === 4) {
            data.GraphType = 4;
            data.GraphTitle = 'Payment Mix';
			data.Interactive = 0;
            data.FiltersApplied = 1;
            data.Results = [];
            for (var a = 0; a < options.countries.length; a++) {
                data.Results.push({ Country: options.countries[a], SubResults: [] });
                for (var b = 0; b < options.pieLabels.length; b++) {
                    data.Results[a].SubResults.push({ Label: options.pieLabels[b], Value: fd.getRandomInt(0, 500), Color: options.pieColors[b] });
                }
            }
        } else if (type === 5) {
            data.GraphType = 5;
            data.GraphTitle = 'Cart To Checkout Funnel';
			data.Interactive = 0;
            data.FiltersApplied = 3;
            data.Results = [
                {
                    Country: 'ar',
                    Segment: 1,
                    SubResults: [
                        {
                            Label: 'Landing',
                            Value: 10000,
                            Percent: -1,
                            SubPercent: 50
                        },
                        {
                            Label: 'Shipping',
                            Value: 5000,
                            Percent: 50,
                            SubPercent: 0
                        },
                        {
                            Label: 'Payments',
                            Value: 3000,
                            Percent: 30,
                            SubPercent: 66
                        },
                        {
                            Label: 'Review',
                            Value: 2000,
                            Percent: 20,
                            SubPercent: 75
                        },
                        {
                            Label: 'Thank You',
                            Value: 1500,
                            Percent: 15,
                            SubPercent: -1
                        }
                    ],
                },
                {
                    Country: 'us',
                    Segment: 1,
                    SubResults: [
                        {
                            Label: 'Landing',
                            Value: 10000,
                            Percent: -1,
                            SubPercent: 50
                        },
                        {
                            Label: 'Shipping',
                            Value: 5000,
                            Percent: 50,
                            SubPercent: 0
                        },
                        {
                            Label: 'Payments',
                            Value: 3000,
                            Percent: 30,
                            SubPercent: 66
                        },
                        {
                            Label: 'Review',
                            Value: 2000,
                            Percent: 20,
                            SubPercent: 75
                        },
                        {
                            Label: 'Thank You',
                            Value: 1500,
                            Percent: 15,
                            SubPercent: -1
                        },
                        {
                            Label: 'Turtles',
                            Value: 800,
                            Percent: 9,
                            SubPercent: -1
                        }
                    ],
                },
                {
                    Country: 'us',
                    Segment: 2,
                    SubResults: [
                        {
                            Label: 'Landing',
                            Value: 9000,
                            Percent: -1,
                            SubPercent: 50
                        },
                        {
                            Label: 'Shipping',
                            Value: 4000,
                            Percent: 50,
                            SubPercent: 0
                        },
                        {
                            Label: 'Payments',
                            Value: 3300,
                            Percent: 30,
                            SubPercent: 66
                        },
                        {
                            Label: 'Review',
                            Value: 1200,
                            Percent: 20,
                            SubPercent: 75
                        },
                        {
                            Label: 'Thank You',
                            Value: 500,
                            Percent: 15,
                            SubPercent: -1
                        },
                        {
                            Label: 'Turtles',
                            Value: 800,
                            Percent: 9,
                            SubPercent: -1
                        }
                    ],
                },
                {
                    Country: 'ca',
                    Segment: 1,
                    SubResults: [
                        {
                            Label: 'Landing',
                            Value: 20000,
                            Percent: -1,
                            SubPercent: 50
                        },
                        {
                            Label: 'Shipping',
                            Value: 10000,
                            Percent: 50,
                            SubPercent: 0
                        },
                        {
                            Label: 'Payments',
                            Value: 6000,
                            Percent: 30,
                            SubPercent: 66
                        },
                        {
                            Label: 'Review',
                            Value: 4000,
                            Percent: 20,
                            SubPercent: 75
                        },
                        {
                            Label: 'Thank You',
                            Value: 3000,
                            Percent: 15,
                            SubPercent: -1
                        }
                    ]
                }
            ];
        } else if (type === 50) {
            data.GraphType = 5;
            data.GraphTitle = 'SubmittedPODetails to OGInfoCollectorCount Funnel';
            data.FiltersApplied = 4;
			data.Interactive = 0;
            data.Results = [
				{
                    "Country": null,
                    "Segment": 0,
                    "Region": "xx",
                    "Identity": "X Co",
                    "SubResults": [
                        {
                            "Label": "SubmittedPODetails",
                            "Value": 4058,
                            "Percent": -1.0,
                            "SubPercent": 98.87
                        },
                        {
                            "Label": "SendPurchaseOrder",
                            "Value": 4012,
                            "Percent": 98.87,
                            "SubPercent": 87.61
                        },
                        {
                            "Label": "PoStatusfromB2BServices",
                            "Value": 3515,
                            "Percent": 86.62,
                            "SubPercent": 95.42
                        },
                        {
                            "Label": "OGInfoCollectorCount",
                            "Value": 3354,
                            "Percent": -1.0,
                            "SubPercent": -1.0
                        }
                    ]
                },
				{
                    "Country": null,
                    "Segment": 0,
                    "Region": "All",
                    "Identity": "All",
                    "SubResults": [
                        {
                            "Label": "SubmittedPODetails",
                            "Value": 6058,
                            "Percent": -1.0,
                            "SubPercent": 88.87
                        },
                        {
                            "Label": "SendPurchaseOrder",
                            "Value": 7012,
                            "Percent": 78.87,
                            "SubPercent": 77.61
                        },
                        {
                            "Label": "PoStatusfromB2BServices",
                            "Value": 8515,
                            "Percent": 76.62,
                            "SubPercent": 55.42
                        },
                        {
                            "Label": "OGInfoCollectorCount",
                            "Value": 4354,
                            "Percent": -1.0,
                            "SubPercent": -1.0
                        }
                    ]
                },
                {
                    "Country": null,
                    "Segment": 0,
                    "Region": "All",
                    "Identity": "CDW",
                    "SubResults": [
                        {
                            "Label": "SubmittedPODetails",
                            "Value": 83,
                            "Percent": -1.0,
                            "SubPercent": 90.0
                        },
                        {
                            "Label": "SendPurchaseOrder",
                            "Value": 73,
                            "Percent": 101.0,
                            "SubPercent": 101.0
                        },
                        {
                            "Label": "PoStatusfromB2BServices",
                            "Value": 63,
                            "Percent": 101.0,
                            "SubPercent": 88.11
                        },
                        {
                            "Label": "OGInfoCollectorCount",
                            "Value": 527,
                            "Percent": -1.0,
                            "SubPercent": -1.0
                        }
                    ]
                },
                {
                    "Country": null,
                    "Segment": 0,
                    "Region": "All",
                    "Identity": "Amazon",
                    "SubResults": [
                        {
                            "Label": "SubmittedPODetails",
                            "Value": 27,
                            "Percent": -1.0,
                            "SubPercent": 100.0
                        },
                        {
                            "Label": "SendPurchaseOrder",
                            "Value": 68,
                            "Percent": 100.0,
                            "SubPercent": -1.0
                        },
                        {
                            "Label": "PoStatusfromB2BServices",
                            "Value": 4,
                            "Percent": -1.0,
                            "SubPercent": -1.0
                        },
                        {
                            "Label": "OGInfoCollectorCount",
                            "Value": 2,
                            "Percent": -1.0,
                            "SubPercent": -1.0
                        }
                    ]
                },
                {
                    "Country": null,
                    "Segment": 0,
                    "Region": "us",
                    "Identity": "ABC Co",
                    "SubResults": [
                        {
                            "Label": "SubmittedPODetails",
                            "Value": 4058,
                            "Percent": -1.0,
                            "SubPercent": 98.87
                        },
                        {
                            "Label": "SendPurchaseOrder",
                            "Value": 4012,
                            "Percent": 98.87,
                            "SubPercent": 87.61
                        },
                        {
                            "Label": "PoStatusfromB2BServices",
                            "Value": 3515,
                            "Percent": 86.62,
                            "SubPercent": 95.42
                        },
                        {
                            "Label": "OGInfoCollectorCount",
                            "Value": 3354,
                            "Percent": -1.0,
                            "SubPercent": -1.0
                        }
                    ]
                },
                {
                    "Country": null,
                    "Segment": 0,
                    "Region": "us",
                    "Identity": "XYZ Co",
                    "SubResults": [
                        {
                            "Label": "SubmittedPODetails",
                            "Value": 53,
                            "Percent": -1.0,
                            "SubPercent": 100.0
                        },
                        {
                            "Label": "SendPurchaseOrder",
                            "Value": 53,
                            "Percent": 100.0,
                            "SubPercent": 100.0
                        },
                        {
                            "Label": "PoStatusfromB2BServices",
                            "Value": 53,
                            "Percent": 100.0,
                            "SubPercent": 98.11
                        },
                        {
                            "Label": "OGInfoCollectorCount",
                            "Value": 52,
                            "Percent": -1.0,
                            "SubPercent": -1.0
                        }
                    ]
                },
                {
                    "Country": null,
                    "Segment": 0,
                    "Region": "us",
                    "Identity": "DEF Co",
                    "SubResults": [
                        {
                            "Label": "SubmittedPODetails",
                            "Value": 2,
                            "Percent": -1.0,
                            "SubPercent": 100.0
                        },
                        {
                            "Label": "SendPurchaseOrder",
                            "Value": 2,
                            "Percent": 100.0,
                            "SubPercent": -1.0
                        },
                        {
                            "Label": "PoStatusfromB2BServices",
                            "Value": 0,
                            "Percent": -1.0,
                            "SubPercent": -1.0
                        },
                        {
                            "Label": "OGInfoCollectorCount",
                            "Value": 0,
                            "Percent": -1.0,
                            "SubPercent": -1.0
                        }
                    ]
                }
            ];
        } else if (type === 6) {
            data.GraphType = 6;
            data.GraphTitle = 'Sales';
			data.Interactive = 0;
            data.FiltersApplied = 3;
            data.Results = [];
            for (var a = 0; a < options.countries.length; a++) {
                data.Results.push({ Country: options.countries[a], Segment: 1, SubResults: [] });
                for (var b = 0; b < options.salesTableLabels.length; b++) {
                    data.Results[a].SubResults.push({
                        Title: options.salesTableLabels[b],
                        Count: fd.getRandomInt(0, 50000),
                        TotalRevenue: fd.getRandomInt(0, 50000000),
                        OrderPercentage: fd.getRandomInt(0, 500000),
                        MarginPercentage: fd.getRandomInt(0, 100),
                        Currency: 'USD'
                    });
                }
            }
        } else if (type === 7) {
            data.GraphType = 7;
            data.GraphTitle = "Revenue By Hour";
			data.Interactive = 0;
            data.FiltersApplied = 3;
            data.Results = [
                {
                    "Country": "us",
                    "Segment": 1,
                    "SubResults": [
                        {
                            "Timestamp": "2019-04-22T05:00:00Z",
                            Line1Value: "29.15",
                            "BarGraphValue": "36"
                        },
                        {
                            "Timestamp": "2019-04-22T06:00:00Z",
                            Line1Value: "19",
                            "BarGraphValue": "43"
                        },
                        {
                            "Timestamp": "2019-04-22T07:00:00Z",
                            Line1Value: "10",
                            "BarGraphValue": "15"
                        },
                        {
                            "Timestamp": "2019-04-22T08:00:00Z",
                            Line1Value: "11",
                            "BarGraphValue": "16"
                        },
                        {
                            "Timestamp": "2019-04-22T09:00:00Z",
                            Line1Value: "9",
                            "BarGraphValue": "16"
                        },
                        {
                            "Timestamp": "2019-04-22T10:00:00Z",
                            Line1Value: "11.5",
                            "BarGraphValue": "15"
                        },
                        {
                            "Timestamp": "2019-04-22T11:00:00Z",
                            Line1Value: "20",
                            "BarGraphValue": "41"
                        },
                        {
                            "Timestamp": "2019-04-22T12:00:00Z",
                            Line1Value: "38.5",
                            "BarGraphValue": "85"
                        },
                        {
                            "Timestamp": "2019-04-22T13:00:00Z",
                            Line1Value: "67",
                            "BarGraphValue": "148"
                        },
                        {
                            "Timestamp": "2019-04-22T14:00:00Z",
                            Line1Value: "96",
                            "BarGraphValue": "253"
                        },
                        {
                            "Timestamp": "2019-04-22T15:00:00Z",
                            Line1Value: "167",
                            "BarGraphValue": "40"
                        }
                    ]
                },
                {
                    "Country": "us",
                    "Segment": 2,
                    "SubResults": [
                        {
                            "Timestamp": "2019-04-22T05:00:00Z",
                            Line1Value: "11",
                            "BarGraphValue": "9"
                        },
                        {
                            "Timestamp": "2019-04-22T06:00:00Z",
                            Line1Value: "8",
                            "BarGraphValue": "6"
                        },
                        {
                            "Timestamp": "2019-04-22T07:00:00Z",
                            Line1Value: "5",
                            "BarGraphValue": "4"
                        },
                        {
                            "Timestamp": "2019-04-22T08:00:00Z",
                            Line1Value: "5",
                            "BarGraphValue": "4"
                        },
                        {
                            "Timestamp": "2019-04-22T09:00:00Z",
                            Line1Value: "4",
                            "BarGraphValue": "4"
                        },
                        {
                            "Timestamp": "2019-04-22T10:00:00Z",
                            Line1Value: "6",
                            "BarGraphValue": "8"
                        },
                        {
                            "Timestamp": "2019-04-22T11:00:00Z",
                            Line1Value: "15",
                            "BarGraphValue": "13"
                        },
                        {
                            "Timestamp": "2019-04-22T12:00:00Z",
                            Line1Value: "42",
                            "BarGraphValue": "49"
                        },
                        {
                            "Timestamp": "2019-04-22T13:00:00Z",
                            Line1Value: "69",
                            "BarGraphValue": "80"
                        },
                        {
                            "Timestamp": "2019-04-22T14:00:00Z",
                            Line1Value: "108",
                            "BarGraphValue": "160"
                        },
                        {
                            "Timestamp": "2019-04-22T15:00:00Z",
                            Line1Value: "248",
                            "BarGraphValue": "28"
                        }
                    ]
                }
            ];

        } else if (type === 9) {
            data.GraphType = 9;
            data.GraphTitle = 'CPU Usage';
            data.GraphHeaders = ['P20', 'P21', 'P60', 'P61'];
			data.Interactive = 0;
            data.FiltersApplied = -1;
            data.Results = [
                {
                    SubResults: [
                        {
                            Label: 'AMER UX',
                            Value1: fd.getRandomInt(0, 100),
                            Value2: fd.getRandomInt(0, 100),
                            Value3: fd.getRandomInt(0, 100),
                            Value4: fd.getRandomInt(0, 100)
                        },
                        {
                            Label: 'AMER API',
                            Value1: fd.getRandomInt(0, 100),
                            Value2: fd.getRandomInt(0, 100),
                            Value3: fd.getRandomInt(0, 100),
                            Value4: fd.getRandomInt(0, 100)
                        },
                        {
                            Label: 'AMER DELL',
                            Value1: fd.getRandomInt(0, 100),
                            Value2: fd.getRandomInt(0, 100),
                            Value3: fd.getRandomInt(0, 100),
                            Value4: fd.getRandomInt(0, 100)
                        },
                        {
                            Label: 'AMER ATX',
                            Value1: fd.getRandomInt(0, 100),
                            Value2: fd.getRandomInt(0, 100),
                            Value3: fd.getRandomInt(0, 100),
                            Value4: fd.getRandomInt(0, 100)
                        }
                    ]
                }
            ];
        } else if (type === 10) {
            data.GraphType = 10;
            data.GraphTitle = 'Shop failure - Errors by URL';
			data.Interactive = 0;
            data.FiltersApplied = -1;
            data.Results = [
                {
                    SubResults: [
                        {
                            'TotalErrors': fd.getRandomInt(0, 5000),
                            'VisitorsImpacted': fd.getRandomInt(0, 5000),
                            Message: '/en-sg/shop/rec/alsdfkjalsdkf'
                        },
                        {
                            'TotalErrors': fd.getRandomInt(0, 5000),
                            'VisitorsImpacted': fd.getRandomInt(0, 5000),
                            Message: '/en-sg/shop/rec/alsdfkjalsdkf'
                        },
                        {
                            'TotalErrors': fd.getRandomInt(0, 5000),
                            'VisitorsImpacted': fd.getRandomInt(0, 5000),
                            Message: '/en-sg/shop/rec/alsdfkjalsdkf'
                        },
                        {
                            'TotalErrors': fd.getRandomInt(0, 5000),
                            'VisitorsImpacted': fd.getRandomInt(0, 5000),
                            Message: '/en-sg/shop/rec/alsdfkjalsdkf'
                        }
                    ]
                }
            ];
        } else if (type === 100) {
            data.GraphType = 10;
            data.GraphTitle = 'Shop failure - Errors by Error Type';
			data.Interactive = 0;
            data.FiltersApplied = -1;
            data.Results = [
                {
                    SubResults: [
                        {
                            'TotalErrors': fd.getRandomInt(0, 5000),
                            'VisitorsImpacted': fd.getRandomInt(0, 5000),
                            'Country': 'us',
                            'Segment': 'bsd',
                            Message: 'Shop failure -> Input not valid Base-64'
                        },
                        {
                            'TotalErrors': fd.getRandomInt(0, 5000),
                            'VisitorsImpacted': fd.getRandomInt(0, 5000),
                            'Country': 'us',
                            'Segment': 'bsd',
                            Message: 'Shop failure -> Input not valid Base-64'
                        },
                        {
                            'TotalErrors': fd.getRandomInt(0, 5000),
                            'VisitorsImpacted': fd.getRandomInt(0, 5000),
                            'Country': 'us',
                            'Segment': 'bsd',
                            Message: 'Shop failure -> Input not valid Base-64'
                        },
                        {
                            'TotalErrors': fd.getRandomInt(0, 5000),
                            'VisitorsImpacted': fd.getRandomInt(0, 5000),
                            'Country': 'us',
                            'Segment': 'bsd',
                            Message: 'Shop failure -> Input not valid Base-64'
                        }
                    ]
                }
            ];
        } else if (type === 11) {
            data.GraphType = 11;
			data.Interactive = 0;
            data.FiltersApplied = -1;
            data.Results = [];
            for (var a = 0; a < options.countries.length; a++) {
                data.Results.push({ Country: options.countries[a], Segment: 1, SubResults: [] });
                for (var b = 0; b < options.speedTableLabels.length; b++) {
                    data.Results[a].SubResults.push({
                        Label: options.speedTableLabels[b],
                        NormalPercent: fd.getRandomInt(0, 100),
                        NormalValue: fd.getRandomInt(0, 5000000),
                        SlowPercent: fd.getRandomInt(0, 100),
                        SlowValue: fd.getRandomInt(0, 100),
                        VerySlowPercent: fd.getRandomInt(0, 100),
                        VerySlowValue: fd.getRandomInt(0, 100)
                    });
                }
            }
        } else if (type === 12) {
            data.GraphType = 12;
            data.GraphTitle = 'By Error Type';
            data.GraphHeaders = ['Error Type', 'Count'];
			data.Interactive = 0;
            data.FiltersApplied = -1;
            data.Results = [];
            data.Results.push({ SubResults: [] });
            for (var b = 0; b < options.speedTableLabels.length; b++) {
                data.Results[0].SubResults.push({
                    Value1: options.speedTableLabels[b],
                    Value2: fd.getRandomInt(0, 100000)
                });
            }
        } else if (type === 13) {
            data.GraphType = 13;
            data.GraphTitle = 'multi color line example';
			data.GraphLegend = ['<20', '20-50', '50-70', '70-100'];
			data.Interactive = 0;
            data.FiltersApplied = -1;
            data.GraphColorRanges = [
                { Offset: "0%", Color: "#CE1126" },
                { Offset: "30%", Color: "#CE1126" },
				{ Offset: "30%", Color: "#00FFFF" },
                { Offset: "50%", Color: "#00FFFF" },
                { Offset: "50%", Color: "#F2AF00" },
                { Offset: "80%", Color: "#F2AF00" },
                { Offset: "80%", Color: "#6EA204" },
                { Offset: "100%", Color: "#6EA204" }
            ];
            data.Results = [];
            data.Results[0] = { SubResults: [] };
            for (var i = 0; i < 24; i++) {
                now = fd.addMinutes(now);
                data.Results[0].SubResults.push({
                    Timestamp: now.toString(),
                    Line1Value: fd.getRandomInt(0, 5000),
					Line1Percentage: fd.getRandomInt(0, 100)
                });
            }
        } else if (type === 14) {
            data.GraphType = 14;
            data.GraphTitle = options.speedTableLabels[fd.getRandomInt(0, (options.speedTableLabels.length - 1))];
            data.GraphNumber = fd.getRandomInt(0, 5000);
	    data.Color = "#CE1126" ;
            data.GraphColorRanges = [
                { Offset: "0%", Color: "#CE1126" },
                { Offset: "80%", Color: "#CE1126" },
                { Offset: "80%", Color: "#F2AF00" },
                { Offset: "90%", Color: "#F2AF00" },
                { Offset: "90%", Color: "#6EA204" },
                { Offset: "100%", Color: "#6EA204" }
            ];
			data.Interactive = 0;
            data.FiltersApplied = -1;
            data.Results = [];
            data.Results[0] = { SubResults: [] };
            for (var i = 0; i < 24; i++) {
                now = fd.addMinutes(now);
                data.Results[0].SubResults.push({
                    Timestamp: now.toString(),
                    Line1Value: fd.getRandomInt(70, 100)
                });
            }
        } else if (type === 14) {
            data.GraphType = 14;
            data.GraphTitle = options.speedTableLabels[fd.getRandomInt(0, (options.speedTableLabels.length - 1))];
            data.GraphNumber = fd.getRandomInt(0, 5000);
	    data.Color = "#CE1126" ;
            data.GraphColorRanges = [
                { Offset: "0%", Color: "#CE1126" },
                { Offset: "80%", Color: "#CE1126" },
                { Offset: "80%", Color: "#F2AF00" },
                { Offset: "90%", Color: "#F2AF00" },
                { Offset: "90%", Color: "#6EA204" },
                { Offset: "100%", Color: "#6EA204" }
            ];
			data.Interactive = 0;
            data.Results = [];
            data.Results[0] = { SubResults: [] };
            for (var i = 0; i < 24; i++) {
                now = fd.addMinutes(now);
                data.Results[0].SubResults.push({
                    Timestamp: now.toString(),
                    Line1Value: fd.getRandomInt(70, 100)
                });
            }
        }else if (type === 15) {
            data.GraphType = 15;
            data.GraphTitle = 'Comments';
			data.Interactive = 0;
            data.FiltersApplied = -1;
            data.Results = [
                {
                    SubResults: [
                        {
                            Rating: fd.getRandomInt(1, 10),
                            Segment: fd.getRandomInt(0, 1),
                            Country: 'US',
                            Time: '09:21:49',
                            Message: 'I had problems with bug.'
                        },
                        {
							Rating: fd.getRandomInt(1, 10),
                            Segment: fd.getRandomInt(0, 1),
                            Country: 'US',
                            Time: '09:21:49',
                            Message: 'I had problems with order.'
                        },
                        {
							Rating: fd.getRandomInt(1, 10),
                            Segment: fd.getRandomInt(0, 1),
                            Country: 'US',
                            Time: '09:21:49',
                            Message: 'I liked order form.'
                        }
                    ]
                }
            ];
        }
        return data;
    };
    /*
     * Initialize script
     */
    fd.dataBlock = [];
	fd.dataBlock.push(fd.generateFakeData(1));
    fd.dataBlock.push(fd.generateFakeData(2));
	fd.dataBlock.push(fd.generateFakeData(3));
    fd.dataBlock.push(fd.generateFakeData(4));
    fd.dataBlock.push(fd.generateFakeData(5));
    fd.dataBlock.push(fd.generateFakeData(6));
    fd.dataBlock.push(fd.generateFakeData(7));
    fd.dataBlock.push(fd.generateFakeData(9));
    fd.dataBlock.push(fd.generateFakeData(10));
    fd.dataBlock.push(fd.generateFakeData(100));
    fd.dataBlock.push(fd.generateFakeData(11));
    fd.dataBlock.push(fd.generateFakeData(12));
    fd.dataBlock.push(fd.generateFakeData(13));
    fd.dataBlock.push(fd.generateFakeData(14));
    fd.dataBlock.push(fd.generateFakeData(14));
    fd.dataBlock.push(fd.generateFakeData(14));
    fd.dataBlock.push(fd.generateFakeData(14));
    fd.dataBlock.push(fd.generateFakeData(50));
	fd.dataBlock.push(fd.generateFakeData(15));
    console.log('fake data generator. dataset=');
    console.log(fd.dataBlock);
    return fd.dataBlock;
};
