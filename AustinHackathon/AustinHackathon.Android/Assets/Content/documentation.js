/* DOCUMENTATION FOR HAWK GRAPHS UI
 *
 * How to edit the code instructions:
 * 1. Make changes to JS/CSS in repo/samples/d3js-docs/
 * 2. Set hawk.hawkDebug = false; on line 8 of hawk.js
 * 3. Lint via https://www.jslint.com/  with options for Tolerate turned on: long lines, single quotes, whitespace
 * 4. Hard minify JS to remove whitespace & compress variable names via https://javascript-minifier.com/
 * 5. Minify CSS via https://cssminifier.com/
 * 6. Copy entire file contents of each JS/CSS from docs folder and replace corresponding files in the Android app.
 *
 * How the hawk.js script works:
 * 1. Accept dataset passed to script.
 * 2. Basic top level data validation.
 * 3. Stage each graph with placeholders on page.
 * 4. Validate data for graph. Show error message if problem discovered in the graph placeholder.
 * 5. If no errors, create graph.
 * 6. Listen for window resize event and then resize graph.
 * 7. Listen for filter changes and update graphs as needed.
 *
 * GraphType (enumerations):
 * 1. stacked bar + line
 * 2. bar
 * 3. line / multi line (max 4)
 * 4. pie
 * 5. funnel
 * 6. sales table
 * 7. bar + line
 * 8. red line
 * 9. heat map
 * 10. error msgs
 * 11. normal vs slow table
 * 12. standard table
 * 13. multi color line
 * 14. overview line item
 * 15. comment msgs
 *
 * Interactive (enumerations):
 * 0. disabled
 * 1. legend based data scroll
 * 2. hover graph tooltips
 *
 * Filters (enumerations):
 * 0. Country (auto generated list from dataset)
 * 1. Segment (enumerations):
 *      1. for home
 *      2. for work
 * 2. Region (auto generated list from dataset)
 * 3. Identity (auto generated list from dataset)
 *
 * FiltersApplied (enumerations):
 * -1. No filters applied
 * 1. Only Country (default: us)
 * 2. Only Segment (default: 1)
 * 3. Country and Segment (default: us, 1)
 * 4. Region then Identity (default: all, all)
 * 5. Region only (default: auto pick All or US or 1st value found)
 * 6. Identity only (default: auto pick All or 1st value found)
 *
 * Data Schema Consistent to All Graphs
 {
 	GraphType
	GraphTitle
	FiltersApplied
	Results: [
		{
			SubResults: []
		}
	]
}
*/

//Data Schema Per Graph Type
var stackedBarGraphData = {
        GraphType: 1,
        GraphTitle: 'P20',
        GraphTitleLabel: '', //optional, will be ignored if attr doesn't exist or empty string in dataset
        GraphY1AxisLabel: 'hits',
        GraphY2AxisLabel: 'ms',
        GraphNumber: 50,
        GraphNumberLabel: '90<sup>th</sup>% ms',
        GraphLink: 'http://google.com',
		Interactive: 0,
        FiltersApplied: -1,
        Results: [
            {
                SubResults: [
                    {
                        Timestamp: 'DATE',
                        Line1Value: 0,
                        StackedBar1Value: 0, //5XX
                        StackedBar2Value: 0, //4XX
                        StackedBar3Value: 0, //3XX
                        StackedBar4Value: 0, //2XX
                        StackedBarTotal: 0
                    }
                ]
            }
        ]
    };
var barGraphData = {
        GraphType: 2,
        GraphTitle: 'Accessories Failure',
        GraphTitleLabel: '', //optional, will be ignored if attr doesn't exist or empty string in dataset
        GraphY1AxisLabel: 'errors',
        GraphNumber: 50,
        GraphNumberLabel: 'Customers Impacted',
        GraphLink: 'http://google.com',
		Interactive: 0,
        FiltersApplied: -1,
        Results: [
            {
                SubResults: [
                    {
                        Timestamp: 'DATE',
                        BarGraphValue: 0
                    }
                ]
            }
        ]
    };
var lineGraphData = {
        GraphType: 3,
        GraphTitle: 'P20',
        GraphTitleLabel: '',
        GraphY1AxisLabel: 'ms',
        GraphNumber: '50',
        GraphNumberLabel: 'some description',
		Interactive: 0,
        FiltersApplied: -1,
        Results: [
            {
                SubResults: [
                    {
                        Timestamp: 'DATE',
                        Line1Value: 80
                    }
                ]
            }
        ]
    };
var pieGraphData = {
        GraphType: 4,
        GraphTitle: 'Payment Mix',
		Interactive: 0,
        FiltersApplied: 3,
        Results: [
            {
                Country: 'us',
                Segment: 1,
                SubResults: [
                    {
                        Label: "CreditCard",
                        Value: "491"
                    },
                    {
                        Label: "DellPreferredAccountNew",
                        Value: "307"
                    }
				]
            }
        ]
    };
var funnelGraphData = {
        GraphType: 5,
        GraphTitle: 'Cart To Checkout Funnel',
		Interactive: 0,
        FiltersApplied: 3,
        Results: [
            {
                Country: 'us',
                Segment: 1,
                SubResults: [
                    {
                        Label: 'Landing',
                        Value: 10000,
                        Percent: -1,
                        SubPercent: 50
                    }
                    //JS script assumes this data is in correct order of large to small bars
                ]
            }
        ]
    };
var salesTableData = {
        GraphType: 6,
        GraphTitle: 'Sales',
		Interactive: 0,
        FiltersApplied: 3,
        Results: [
            {
                Country: 'us',
                Segment: 1,
                SubResults: [
                    {
                        Title: 'All Order Submissions',
                        Count: 0,
                        TotalRevenue: 0,
                        OrderPercentage: 0,
                        MarginPercentage: 0,
                        Currency: 'USD'
                    }
                ]
            }
        ]
    };
var barLineGraphData = {
        GraphType: 7,
        GraphTitle: 'Revenue By Hour',
		Interactive: 0,
        FiltersApplied: 3,
        Results: [
            {
                Country: "us",
                Segment: 1,
                SubResults: [
                    {
                        Timestamp: "2019-04-22T05:00:00Z",
                        Line1Value: "29",
                        BarGraphValue: "36"
                    },
                ]
            }
        ]
    };
var heatMapData = {
        GraphType: 9,
        GraphTitle: 'CPU Usage',
        GraphHeaders: ['P20', 'P21', 'P60', 'P61'],
		Interactive: 0,
        FiltersApplied: -1,
        Results: [
            {
                SubResults: [
                    {
                        Label: 'AMER UX',
                        Value1: 67,
                        Value2: 50,
                        Value3: 49,
                        Value4: 20
                    }
                ]
            }
        ]
    };
var errorMessageListData = {
        GraphType: 10,
        GraphTitle: 'Shop failure - Errors by Error Type',
		Interactive: 0,
        FiltersApplied: -1,
        Results: [
            {
                SubResults: [
                    {
                        TotalErrors: 0,
                        VisitorsImpacted: 0,
                        Country: 'us',
                        Segment: 'bsd',
                        Message: 'Shop failure -> Input not valid Base-64'
                    }
                ]
            }
        ]
    };
var speedTableData = {
    GraphType: 11,
    GraphTitle: '',
	Interactive: 0,
    FiltersApplied: -1,
    Results: [
        {
            Country: 'us',
            Segment: 1,
            SubResults: [
                {
                    Label: 'Product Details',
                    NormalPercent: 90,
                    NormalValue: 1000000,
                    SlowPercent: 5,
                    SlowValue: 70,
                    VerySlowPercent: 5,
                    VerySlowValue: 85
                }
            ]
        }
    ]
};
var standardTableData = {
    GraphType: 12,
    GraphTitle: 'By Error Type',
    GraphHeaders: ['Error Type', 'Count'],
	Interactive: 0,
    FiltersApplied: -1,
    Results: [
        {
            Country: 'us',
            Segment: 1,
            SubResults: [
                {
                    Value1: 'Product Details',
                    Value2: 50
                }
            ]
        }
    ]
};
var multiColorLineData = {
    GraphType: 13,
    GraphTitle: 'multi color line example',
	GraphLegend: ['<20', '20-50', '>50'],//red, yellow, green labels
    GraphColorRanges: [
        { Offset: "0%", Color: "#CE1126" },
        { Offset: "80%", Color: "#CE1126" },
        { Offset: "80%", Color: "#F2AF00" },
        { Offset: "90%", Color: "#F2AF00" },
        { Offset: "90%", Color: "#6EA204" },
        { Offset: "100%", Color: "#6EA204" }
    ],
	Interactive: 0,
    FiltersApplied: -1,
    Results: [
        {
            SubResults: [
                {
                    Timestamp: 'date',
                    Line1Value: 3980,
					Line1Percentage: 90
                }
            ]
        }
    ]
};
var overviewLineItemData = {
    GraphType: 14,
    GraphTitle: 'CPU Utilization',
    GraphNumber: '5000',
    Color = '#CE1126' ;
    GraphColorRanges: [
        { Offset: "0%", Color: "#CE1126" },
        { Offset: "80%", Color: "#CE1126" },
        { Offset: "80%", Color: "#F2AF00" },
        { Offset: "90%", Color: "#F2AF00" },
        { Offset: "90%", Color: "#6EA204" },
        { Offset: "100%", Color: "#6EA204" }
    ],
	Interactive: 0,
    FiltersApplied: -1,
    Results: [
        {
            SubResults: [
                {
                    Timestamp: 'date',
                    Line1Value: 90
                }
            ]
        }
    ]
};
var commentMessageData = {
        GraphType: 15,
        GraphTitle: 'Comments',
		Interactive: 0,
        FiltersApplied: -1,
        Results: [
            {
                SubResults: [
                    {
                        rating: 1,
                        Segment: 1,
                        Message: 'I had some problems ordering with site bug.'
                    }
                ]
            }
        ]
    };

//Function List
hawk.getMinutesSinceLastUpdate();
hawk.setLastUpdatedDate(index);
hawk.isLargerDate(d);
hawk.listenFilterChange(filterIndex);
hawk.createFilter(index, filterIndex);
hawk.createFilters();
hawk.updateGraphByFilter(filterIndex);
hawk.filterDataForGraph(index);
hawk.compareErrorCounts(data);
hawk.get3xxCount(index);
hawk.createPieGraph(index, resultIndex);
hawk.generateFunnelCoords(index);
hawk.createFunnelGraph(index, resultIndex);
hawk.createSalesTable(index, resultIndex);
hawk.createSpeedTable(index, resultIndex);
hawk.createStandardTable(index, resultIndex);
hawk.createHeatMap(index, resultIndex);
hawk.createMessageList(index, resultIndex);
hawk.createCommentMessages(index, resultIndex);
hawk.createLineGraph(index, resultIndex, graph);
hawk.createMultiColorLineGraph(index, resultIndex);
hawk.createOverviewLineItem(index, resultIndex);
hawk.createGridlines(index, graph);
hawk.createAxis(index, resultIndex, graph);
hawk.createBarGraph(index, resultIndex);
hawk.createGraphType7(index, resultIndex);
hawk.createStackedBarGraph(index, resultIndex);
hawk.detailedInfo(index);
hawk.createLegend(index, index2);
hawk.graphLinkOut(index);
hawk.redrawGraph(index);
hawk.createGraph(index);
hawk.validateGraphData(index);
hawk.createGraphContainer(index);
hawk.globalConfig();
hawk.validateDataset();
hawk.init();
