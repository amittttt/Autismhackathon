/*
 * Create D3JS graphs for Dell SRE data.
 */
var hawkGraphs = function (x) {
    // Hawk: Global var & func container object
    var hawk = {};
    hawk.formatNumber = function (num) {
        isNegative = false;
        if (num < 0) {
            isNegative = true;
        }

        var normalizedNumber = num;
        var numberSuffix = "";

        num = Math.abs(num);
        if (num >= 1000000000) {
            normalizedNumber = (num / 1000000000);
            numberSuffix = "B";
        } else if (num >= 1000000) {
            normalizedNumber = (num / 1000000);
            numberSuffix = "M";
        } else if (num >= 1000) {
            normalizedNumber = (num / 1000);
            numberSuffix = "K";
        } else {
            normalizedNumber = num;
        }

        formattedNumber = normalizedNumber.toFixed(1).replace(/\.0$/, "") + numberSuffix;

        if (isNegative) { formattedNumber = "-" + formattedNumber; }
        return formattedNumber;
    };
    hawk.incomingData = x;
    hawk.hawkDebug = false;
    /*
     * Return difference of minutes between now datetime & last datetime from dataset.
     * @return Int diffMins
     */
    hawk.getMinutesSinceLastUpdate = function () {
        // format date before processing
        hawk.lastDate = new Date(hawk.lastDate);
        var diffMs = (hawk.now - hawk.lastDate), // milliseconds between now & last date
            diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)), // days
            diffHrs = Math.floor((diffMs % 86400000) / 3600000), // hours
            diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000), // minutes
            diff = '';
        if (diffDays > 0) {
            diff += diffDays + ' days, ';
        }
        if (diffHrs > 0) {
            diff += diffHrs + ' hours, ';
        }
        diff += diffMins + ' minutes';
        if (hawk.hawkDebug) { console.log('hawk.getMinutesSinceLastUpdate @lastDate=' + hawk.lastDate + ' @now=' + hawk.now + ' @diff=' + diff); }
        return diff;
    };
    /*
     * Calculate last updated date from data.
     * @param Int index
     */
    hawk.setLastUpdatedDate = function (index) {
        // Calc last updated datetime
        if (hawk.data[index].Results[0].SubResults[0].Timestamp != undefined && hawk.data[index].Results[0].SubResults[0].Timestamp != null) {
            if (hawk.isLargerDate(hawk.data[index].Results[0].SubResults[hawk.data[index].Results[0].SubResults.length - 1].Timestamp)) {
                hawk.lastDate = hawk.data[index].Results[0].SubResults[hawk.data[index].Results[0].SubResults.length - 1].Timestamp;
            }
        }
    };
    /*
     * Return true if incoming date is later than hawk.lastDate
     * @return Bool result
     */
    hawk.isLargerDate = function (d) {
        // format date before processing
        hawk.lastDate = new Date(hawk.lastDate);
        d = new Date(d);
        if (d > hawk.lastDate) {
            if (hawk.hawkDebug) { console.log('hawk.isLargerDate @result=T'); }
            return true;
        } else {
            if (hawk.hawkDebug) { console.log('hawk.isLargerDate @result=F'); }
            return false;
        }
    };
    /*
     * Listen for user changing filter selection.
	 * @param Int index
     * @param Int filterIndex
     */
    hawk.listenFilterChange = function (index, filterIndex) {
        if (hawk.hawkDebug) { console.log('hawk.listenFilterChange @filter=' + hawk.filters[filterIndex].label + ' @index=' + index); }
        //watch for changes to filter input. pass index value into function
        $('.sel-' + (hawk.filters[filterIndex].label.toString().toLowerCase())).change(function (event, i = index) {
            if (hawk.hawkDebug) { console.log('hawk.listenFilterChange @FilterValueChanged! @filter=' + hawk.filters[filterIndex].label + ' @index=' + i); }
            var that = this;
            if (filterIndex == 1) {
                hawk.filters[filterIndex].active = parseInt($(that).val());
            } else {
                hawk.filters[filterIndex].active = $(that).val();
                //if Region changes, have to update Identity if tied together
                if (filterIndex == 2 && parseInt(hawk.data[i].FiltersApplied) == 4) {
                    $('.filter3').remove();
                    hawk.filters[3].inputShowing = false;
                    hawk.createFilter(i, 3);
                }
            }
            if (hawk.hawkDebug) { console.log('hawk.listenFilterChange @filter=' + hawk.filters[filterIndex].label + ' @valueChange=' + hawk.filters[filterIndex].active); }
            hawk.updateGraphByFilter(filterIndex);
        });
    };
    /*
     * Create HTML select input. Then listen for user selection to update graphs.
     * @param Int index
     * @param Int filterIndex
     */
    hawk.createFilter = function (index, filterIndex) {
        //if filter is not already on page, create it
        if (hawk.filters[filterIndex].inputShowing == false) {
            if (hawk.hawkDebug) { console.log('hawk.createFilter @filter=' + hawk.filters[filterIndex].label); }
            //if not Segment filter, get select options from dataset
            if (filterIndex == 3) {
                var region = $('.sel-region').val();
                //reset values array for filter
                hawk.filters[filterIndex].filterValues = [];
                for (var d = 0; d < hawk.data[index].Results.length; d++) {
                    //if FiltersApplied set to tie Region and Identity together, only pull values for Identity that have matching Region
                    if (parseInt(hawk.data[index].FiltersApplied) == 4) {
                        if (hawk.filters[filterIndex].filterValues.indexOf(hawk.data[index].Results[d][hawk.filters[filterIndex].label]) === -1 && hawk.data[index].Results[d].Region == region) {
                            hawk.filters[filterIndex].filterValues.push(hawk.data[index].Results[d][hawk.filters[filterIndex].label]);
                        }
                        //else pull all values for Identity
                    } else {
                        if (hawk.filters[filterIndex].filterValues.indexOf(hawk.data[index].Results[d][hawk.filters[filterIndex].label]) === -1) {
                            hawk.filters[filterIndex].filterValues.push(hawk.data[index].Results[d][hawk.filters[filterIndex].label]);
                        }
                    }
                }
            } else if (filterIndex != 1) {
                for (var d = 0; d < hawk.data[index].Results.length; d++) {
                    if (hawk.filters[filterIndex].filterValues.indexOf(hawk.data[index].Results[d][hawk.filters[filterIndex].label]) === -1) {
                        hawk.filters[filterIndex].filterValues.push(hawk.data[index].Results[d][hawk.filters[filterIndex].label]);
                    }
                }
            }
            //build select input html
            var html = '<div class="select-container filter' + filterIndex + '">' + hawk.filters[filterIndex].label + ' <select class="sel-input sel-' + hawk.filters[filterIndex].label.toString().toLowerCase() + '">';
            for (var f in hawk.filters[filterIndex].filterValues) {
                if (filterIndex == 1) {
                    html += '<option value="' + hawk.filters[filterIndex].filterValues[f].value + '">' + hawk.filters[filterIndex].filterValues[f].label + '</option>';
                } else {
                    html += '<option value="' + hawk.filters[filterIndex].filterValues[f] + '">' + hawk.filters[filterIndex].filterValues[f] + '</option>';
                }
            }
            html += '</select></div>';
            //add filter to page
            $('.filters').append(html);
            hawk.filters[filterIndex].inputShowing = true;
            //set default values
            if (filterIndex == 0 || filterIndex == 2) {
                if (hawk.filters[filterIndex].filterValues.indexOf('us') != -1) {
                    hawk.filters[filterIndex].active = 'us';
                } else if (hawk.filters[filterIndex].filterValues.indexOf('All') != -1) {
                    hawk.filters[filterIndex].active = 'All';
                } else {
                    hawk.filters[filterIndex].active = hawk.filters[filterIndex].filterValues[0];
                }
                $('.filter' + filterIndex + ' select').val(hawk.filters[filterIndex].active);
            } else if (filterIndex == 3) {
                if (hawk.filters[filterIndex].filterValues.indexOf('All') != -1) {
                    hawk.filters[filterIndex].active = 'All';
                } else {
                    hawk.filters[filterIndex].active = hawk.filters[filterIndex].filterValues[0];
                }
                $('.filter' + filterIndex + ' select').val(hawk.filters[filterIndex].active);
            }
            if (hawk.hawkDebug) { console.log('hawk.createFilter @filter=' + hawk.filters[filterIndex].label + ' @active=' + hawk.filters[filterIndex].active); }
            //listen for change of selected option
            hawk.listenFilterChange(index, filterIndex);
        }
        return;
    };
    /*
     * Walk through dataset and trigger creating filters as necessary.
     */
    hawk.createFilters = function () {
        if (hawk.hawkDebug) { console.log('hawk.createFilters'); }
        var filtersEnabled = 0;
        //walk thru all datasets and see if they need filters turned on
        for (var index = 0; index < hawk.data.length; index++) {
            //if filters are defined continue and create individual filters
            if (parseInt(hawk.data[index].FiltersApplied) != -1)
                filtersEnabled = 1;
            switch (parseInt(hawk.data[index].FiltersApplied)) {
                case -1:
                    //no filters applied
                    break;
                case 1:
                    hawk.createFilter(index, 0);
                    break;
                case 2:
                    hawk.createFilter(index, 1);
                    break;
                case 3:
                    hawk.createFilter(index, 0);
                    hawk.createFilter(index, 1);
                    break;
                case 4:
                    hawk.createFilter(index, 2);
                    hawk.createFilter(index, 3);
                    break;
                case 5:
                    hawk.createFilter(index, 2);
                    break;
                case 6:
                    hawk.createFilter(index, 3);
                    break;
            }
        }
        if (!filtersEnabled)
            $(".filters").remove();
        return;
    };
    /*
     * Update graphs that support alternative datasets user selected from select inputs.
     * @param Int filterIndex
     */
    hawk.updateGraphByFilter = function (filterIndex) {
        if (hawk.hawkDebug) { console.log('hawk.updateGraphByFilter @filter=' + hawk.filters[filterIndex].label); }
        // Update graphs that consume the filter that changed value
        for (var index = 0; index < hawk.data.length; index++) {
            switch (filterIndex) {
                case 0:
                    if (parseInt(hawk.data[index].FiltersApplied) == 1 || parseInt(hawk.data[index].FiltersApplied) == 3) {
                        hawk.redrawGraph(index);
                    }
                    break;
                case 1:
                    if (parseInt(hawk.data[index].FiltersApplied) == 2 || parseInt(hawk.data[index].FiltersApplied) == 3) {
                        hawk.redrawGraph(index);
                    }
                    break;
                case 2:
                    if (parseInt(hawk.data[index].FiltersApplied) == 4 || parseInt(hawk.data[index].FiltersApplied) == 5) {
                        hawk.redrawGraph(index);
                    }
                case 3:
                    if (parseInt(hawk.data[index].FiltersApplied) == 4 || parseInt(hawk.data[index].FiltersApplied) == 6) {
                        hawk.redrawGraph(index);
                    }
                    break;
            }
        }
        return;
    };
    /*
     * Find results index for graph data that matches currently selected filters.
     * @param Int index
     * @return Int resultIndex
     */
    hawk.filterDataForGraph = function (index) {
        var resultIndex = -1;
        switch (hawk.data[index].FiltersApplied) {
            case -1:
                //no filters applied, use first dataset
                resultIndex = 0;
                break;
            case 1:
                for (var a = 0; a < hawk.data[index].Results.length; a++) {
                    if (hawk.data[index].Results[a].Country === hawk.filters[0].active) {
                        resultIndex = a;
                    }
                }
                break;
            case 2:
                for (var a = 0; a < hawk.data[index].Results.length; a++) {
                    if (hawk.data[index].Results[a].Segment === hawk.filters[1].active) {
                        resultIndex = a;
                    }
                }
                break;
            case 3:
                for (var a = 0; a < hawk.data[index].Results.length; a++) {
                    if (hawk.data[index].Results[a].Country === hawk.filters[0].active && hawk.data[index].Results[a].Segment === hawk.filters[1].active) {
                        resultIndex = a;
                    }
                }
                break;
            case 4:
                for (var a = 0; a < hawk.data[index].Results.length; a++) {
                    if (hawk.data[index].Results[a].Region === hawk.filters[2].active && hawk.data[index].Results[a].Identity === hawk.filters[3].active) {
                        resultIndex = a;
                    }
                }
                break;
            case 5:
                for (var a = 0; a < hawk.data[index].Results.length; a++) {
                    if (hawk.data[index].Results[a].Region === hawk.filters[2].active) {
                        resultIndex = a;
                    }
                }
                break;
            case 6:
                for (var a = 0; a < hawk.data[index].Results.length; a++) {
                    if (hawk.data[index].Results[a].Identity === hawk.filters[3].active) {
                        resultIndex = a;
                    }
                }
                break;
            default:
                //return -1 indicates an error data not found
                resultIndex = -1;
                break;
        }
        if (hawk.hawkDebug) { console.log('hawk.filterDataForGraph @graphID=' + index + ' @resultIndex=' + resultIndex); }
        return resultIndex;
    };
    /*
     * Count 3xx data.
     * @param Int index
     */
    hawk.get3xxCount = function (index) {
        var values = hawk.data[index].Results[0].SubResults.map(function (d) { return parseInt(d.StackedBar3Value); }),
            reducer = function (accumulator, currentValue) {
                return accumulator + currentValue;
            },
            sum = values.reduce(reducer);
        if (hawk.hawkDebug) { console.log('hawk.get3xxCount @sum=' + sum); }
        return sum;
    };
    /*
     * Create pie graph to svg.
     * @param Int index
	 * @param Int resultIndex
     */
    hawk.createPieGraph = function (index, resultIndex) {
        if (hawk.hawkDebug) { console.log('hawk.createPieGraph @graphID=' + index); }
        hawk.data[index].config.totalCount = 0;
        hawk.data[index].config.html = '<div class="graph-title">' + hawk.data[index].GraphTitle + '</div><svg class="graph"></svg><div class="graph-legend graph-legend-pie"></div>';
        hawk.data[index].config.radius = Math.min(hawk.svgWidth, hawk.svgHeight) / 2;

        // If pie colors have been provided, use them first
        var providedColors = new Array();
        for (var i = 0; i < hawk.data[index].Results[resultIndex].SubResults.length; i++) {
            if (hawk.data[index].Results[resultIndex].SubResults[i].Color != undefined && hawk.data[index].Results[resultIndex].SubResults[i].Color != null && hawk.data[index].Results[resultIndex].SubResults[i].Color != '')
                providedColors.push(hawk.data[index].Results[resultIndex].SubResults[i].Color);
        }

        providedColors = providedColors.concat(hawk.colors);

        hawk.data[index].config.colors = d3.scaleOrdinal()
            .range(providedColors);
        hawk.data[index].config.arc = d3.arc()
            .outerRadius(hawk.data[index].config.radius)
            .innerRadius(hawk.data[index].config.radius * 0.4);
        hawk.data[index].config.pie = d3.pie()
            .sort(null)
            .startAngle(1.1 * Math.PI)
            .endAngle(3.1 * Math.PI)
            .value(function (d) { return d.Value; });
        // Add svg to page
        $('.graph' + index).html(hawk.data[index].config.html).width(hawk.svgWidth);
        // Add pie graph to svg
        var graph = d3.select('.graph' + index + ' .graph')
            .attr('width', hawk.svgWidth)
            .attr('height', hawk.svgHeight);
        graph.append('g')
            .attr("transform", "translate(" + (hawk.svgWidth / 2) + "," + (hawk.svgHeight / 2) + ")")
            .selectAll(".arc")
            .data(hawk.data[index].config.pie(hawk.data[index].Results[resultIndex].SubResults))
            .enter()
            .append("path")
            .style("fill", function (d, i) { return hawk.data[index].config.colors(i); })
            // Animations
            .transition()
            .delay(function (d, i) {
                return i * 300;
            }).duration(300)
            .attrTween('d', function (d) {
                var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
                return function (t) {
                    d.endAngle = i(t);
                    return hawk.data[index].config.arc(d)
                }
            });
        // Create legend
        hawk.createLegend(index, resultIndex, providedColors);
        return;
    };
    /*
     * Generate sets of trapezoid coordinates for funnel graph.
     * @param Int index
     * @return {Object} coords
     */
    hawk.generateFunnelCoords = function (index) {
        var coords = [],
            // Original Corners of 1st bar
            //{ x: 0, y: 0 },{ x: 500, y: 0 },{ x: 475, y: 70 },{ x: 25, y: 70 }
            // Rounded Corners
            coordsTopLeft = [{ x: 0, y: 10 }, { x: 0, y: 9 }, { x: 0, y: 8 }, { x: 1, y: 5 }, { x: 3, y: 3 }, { x: 4, y: 2 }, { x: 6, y: 1 }, { x: 10, y: 0 }],
            coordsTopRight = [{ x: 490, y: 0 }, { x: 494, y: 1 }, { x: 496, y: 2 }, { x: 497, y: 3 }, { x: 499, y: 5 }, { x: 500, y: 8 }, { x: 500, y: 9 }, { x: 500, y: 10 }],
            coordsBottomRight = [{ x: 485, y: 65 }, { x: 483, y: 70 }, { x: 480, y: 74 }, { x: 478, y: 76 }, { x: 476, y: 78 }, { x: 474, y: 79 }, { x: 471, y: 80 }, { x: 470, y: 80 }],
            coordsBottomLeft = [{ x: 25, y: 80 }, { x: 23, y: 80 }, { x: 20, y: 79 }, { x: 18, y: 78 }, { x: 16, y: 76 }, { x: 14, y: 74 }, { x: 11, y: 70 }, { x: 10, y: 65 }],
            origScale = 500,
            scale = hawk.svgWidth / origScale;
        for (var i = 0; i < 6; i++) {
            var set = [];
            coordsTopLeft.forEach(function (element) {
                //diff = x: +25, y: +120
                set.push({ x: ((element.x + (i * 25)) * scale), y: ((element.y + (i * 120)) * scale) });
            });
            coordsTopRight.forEach(function (element) {
                //diff = x: -25, y: +120
                set.push({ x: ((element.x - (i * 25)) * scale), y: ((element.y + (i * 120)) * scale) });
            });
            coordsBottomRight.forEach(function (element) {
                //diff = x: -25, y: +120
                set.push({ x: ((element.x - (i * 25)) * scale), y: ((element.y + (i * 120)) * scale) });
            });
            coordsBottomLeft.forEach(function (element) {
                //diff = x: +25, y: +120
                set.push({ x: ((element.x + (i * 25)) * scale), y: ((element.y + (i * 120)) * scale) });
            });
            coords.push(set);
        }
        if (hawk.hawkDebug) {
            console.log('hawk.generateFunnelCoords @graphID=' + index + ' @coords=');
            console.log(coords);
        }
        return coords;
    };
    /*
     * Create funnel graph to page.
     * @param Int index
	 * @param Int resultIndex
     */
    hawk.createFunnelGraph = function (index, resultIndex) {
        if (hawk.hawkDebug) { console.log('hawk.createFunnelGraph @graphID=' + index); }
        // Trapezoid shape coordinates
        hawk.data[index].config.points = hawk.generateFunnelCoords(index);
        // More config
        hawk.data[index].config.html = '<div class="graph-title">Cart to Checkout Funnel</div><svg class="graph"></svg>';
        hawk.data[index].config.line = d3.line()
            .x(function (d) { return d.x; })
            .y(function (d) { return d.y; });
        // Add svg to page
        var graph;
        $('.graph' + index).html(hawk.data[index].config.html).width(hawk.svgWidth);
        // Calculate svg height based on number of funnel bars * funnel bar height
        hawk.data[index].config.graphHeight = hawk.data[index].Results[resultIndex].SubResults.length * (hawk.data[index].config.points[1][6].y - hawk.data[index].config.points[0][6].y);
        if (hawk.hawkDebug) { console.log('@numBars=' + hawk.data[index].Results[resultIndex].SubResults.length + ' @2ndBarTop=' + hawk.data[index].config.points[1][21].y + ' @1stBarTop=' + hawk.data[index].config.points[0][6].y + ' @svgHeight=' + hawk.svgHeight); }
        // Add graph to svg
        graph = d3.select('.graph' + index + ' .graph')
            .attr('width', hawk.svgWidth)
            .attr('height', hawk.data[index].config.graphHeight)
            .append('g')
            .attr('transform', 'translate(0,0)');
        for (var i = 0; i < hawk.data[index].Results[resultIndex].SubResults.length; i++) {
            // Add trapezoid to graph
            graph.append('path')
                .style("fill", hawk.funnelColors[i])
                .style("stroke", "none")
                .attr("d", hawk.data[index].config.line(hawk.data[index].config.points[i]) + 'Z');
            // Add title text
            graph.append('text')
                .attr("x", ((((hawk.data[index].config.points[i][8].x - hawk.data[index].config.points[i][0].x) - ((hawk.data[index].Results[resultIndex].SubResults[i].Label.length + 2) * 5)) / 2)) + hawk.data[index].config.points[i][0].x)
                .attr("y", (hawk.data[index].config.points[i][0].y + 10))
                .attr("class", "funnel-title")
                .text(hawk.data[index].Results[resultIndex].SubResults[i].Label);
            // Add percentage text
            if (parseInt(hawk.data[index].Results[resultIndex].SubResults[i].Percent) !== -1) {
                if (hawk.data[index].Results[resultIndex].SubResults[i].Percent == null || hawk.data[index].Results[resultIndex].SubResults[i].Percent == '') {
                    hawk.data[index].Results[resultIndex].SubResults[i].Percent = 0;
                }
                graph.append('text')
                    .attr("x", (hawk.data[index].config.points[i][0].x + 15))
                    .attr("y", (hawk.data[index].config.points[i][0].y + 15))
                    .attr("class", "funnel-perc")
                    .text(hawk.data[index].Results[resultIndex].SubResults[i].Percent + '%');
            }
            // Add sub-percentage text
            if (parseInt(hawk.data[index].Results[resultIndex].SubResults[i].SubPercent) !== -1) {
                if (hawk.data[index].Results[resultIndex].SubResults[i].SubPercent == null || hawk.data[index].Results[resultIndex].SubResults[i].SubPercent == '') {
                    hawk.data[index].Results[resultIndex].SubResults[i].SubPercent = 0;
                }
                graph.append('text')
                    .attr("x", (hawk.data[index].config.points[i][16].x - 40))
                    .attr("y", (hawk.data[index].config.points[i][16].y + 30))
                    .attr("class", "funnel-sub-perc")
                    .text(hawk.data[index].Results[resultIndex].SubResults[i].SubPercent + '%');
            }
            // Add visitors text
            graph.append('text')
                .attr("x", ((((hawk.data[index].config.points[i][16].x - hawk.data[index].config.points[i][3].x) - ((hawk.data[index].Results[resultIndex].SubResults[i].Value.toString().length + 15) * 6)) / 2)) + hawk.data[index].config.points[i][24].x)
                .attr("y", (hawk.data[index].config.points[i][16].y))
                .attr("class", "funnel-count")
                .text(hawk.formatNumber(hawk.data[index].Results[resultIndex].SubResults[i].Value) + ' visitors');
        }
        return;
    };
    /*
     * Create data table on page.
     * @param Int index
	 * @param Int resultIndex
     */
    hawk.createSalesTable = function (index, resultIndex) {
        if (hawk.hawkDebug) { console.log('hawk.createTable @graphID=' + index); }
        // Table headers
        hawk.data[index].config.html = '<div class="row table-header">' +
            '<div class="row-data">Sales</div>' +
            '<div class="row-data">Total Orders</div>' +
            '<div class="row-data">Total Revenue ' + hawk.data[index].Results[resultIndex].SubResults[0].Currency + '</div>' +
            '<div class="row-data">Order Percentage</div>' +
            '<div class="row-data">Margin Percentage</div></div>';
        // Table data
        for (var i = 0; i < hawk.data[index].Results[resultIndex].SubResults.length; i++) {
            hawk.data[index].config.html += '<div class="row">' +
                '<div class="row-data">' + hawk.data[index].Results[resultIndex].SubResults[i].Title + '</div>' +
                '<div class="row-data">' + hawk.data[index].Results[resultIndex].SubResults[i].Count + '</div>' +
                '<div class="row-data">' + hawk.formatNumber(hawk.data[index].Results[resultIndex].SubResults[i].TotalRevenue) + '</div>' +
                '<div class="row-data">' + hawk.data[index].Results[resultIndex].SubResults[i].OrderPercentage + '</div>' +
                '<div class="row-data">' + hawk.data[index].Results[resultIndex].SubResults[i].MarginPercentage + '%</div></div>';
        }
        // Add table HTML to page
        $('.graph' + index).addClass('sales-table').html(hawk.data[index].config.html).width(hawk.svgWidth);
        return;
    };
    /*
     * Create normal vs slow speed data table on page.
     * @param Int index
	 * @param Int resultIndex
     */
    hawk.createSpeedTable = function (index, resultIndex) {
        if (hawk.hawkDebug) { console.log('hawk.createSpeedTable @graphID=' + index); }
        // Table headers
        hawk.data[index].config.html = '<div class="row table-header">' +
            '<div class="row-data"></div>' +
            '<div class="row-data">Normal</div>' +
            '<div class="row-data">Slow</div>' +
            '<div class="row-data">Very Slow</div></div>';
        // Table data
        for (var i = 0; i < hawk.data[index].Results[resultIndex].SubResults.length; i++) {
            hawk.data[index].config.html += '<div class="row">' +
                '<div class="row-data">' + hawk.data[index].Results[resultIndex].SubResults[i].Label + '</div>' +
                '<div class="row-data"><div class="split-cell">' + hawk.data[index].Results[resultIndex].SubResults[i].NormalPercent + '%</div><div class="split-cell">' + hawk.formatNumber(hawk.data[index].Results[resultIndex].SubResults[i].NormalValue) + '</div></div>' +
                '<div class="row-data"><div class="split-cell">' + hawk.data[index].Results[resultIndex].SubResults[i].SlowPercent + '%</div><div class="split-cell">' + hawk.formatNumber(hawk.data[index].Results[resultIndex].SubResults[i].SlowValue) + '</div></div>' +
                '<div class="row-data"><div class="split-cell">' + hawk.data[index].Results[resultIndex].SubResults[i].VerySlowPercent + '%</div><div class="split-cell">' + hawk.formatNumber(hawk.data[index].Results[resultIndex].SubResults[i].VerySlowValue) + '</div></div></div>';
        }
        // Add table HTML to page
        $('.graph' + index).addClass('speed-table').html(hawk.data[index].config.html).width(hawk.svgWidth);
        return;
    };
    /*
     * Create standard data table on page.
     * @param Int index
	 * @param Int resultIndex
     */
    hawk.createStandardTable = function (index, resultIndex) {
        if (hawk.hawkDebug) { console.log('hawk.createStandardTable @graphID=' + index); }
        hawk.data[index].config.html = '<div class="graph-title">' + hawk.data[index].GraphTitle + '</div>';
        // Table headers
        hawk.data[index].config.html += '<div class="row table-header">';
        for (var a = 0; a < hawk.data[index].GraphHeaders.length; a++) {
            hawk.data[index].config.html += '<div class="row-data" style="width:calc(' + (100 / hawk.data[index].GraphHeaders.length) + '% - 11px);">' + hawk.data[index].GraphHeaders[a] + '</div>';
        }
        hawk.data[index].config.html += '</div>';
        // Table data
        for (var b = 0; b < hawk.data[index].Results[resultIndex].SubResults.length; b++) {
            hawk.data[index].config.html += '<div class="row">';
            var colCount = 0;
            for (var c in hawk.data[index].Results[resultIndex].SubResults[b]) {
                colCount++;
                if (colCount <= hawk.data[index].GraphHeaders.length)
                    hawk.data[index].config.html += '<div class="row-data" style="width:calc(' + (100 / hawk.data[index].GraphHeaders.length) + '% - 11px);">' + hawk.data[index].Results[resultIndex].SubResults[b][c] + '</div>';
            }
            hawk.data[index].config.html += '</div>';
        }
        // Add table HTML to page
        $('.graph' + index).addClass('standard-table').html(hawk.data[index].config.html).width(hawk.svgWidth);
        return;
    };
    /*
     * Create heat map graph.
     * @param Int index
	 * @param Int resultIndex
     */
    hawk.createHeatMap = function (index, resultIndex) {
        if (hawk.hawkDebug) { console.log('hawk.createHeatMap @graphID=' + index); }
        hawk.data[index].config.html = '<div class="graph-title">' + hawk.data[index].GraphTitle + '</div>';
        // Table headers
        hawk.data[index].config.html += '<div class="row table-header"><div class="row-data">&nbsp;</div>';
        for (var a = 0; a < hawk.data[index].GraphHeaders.length; a++) {
            hawk.data[index].config.html += '<div class="row-data" style="width:' + ((hawk.svgWidth - 114) / hawk.data[index].GraphHeaders.length) + 'px">' + hawk.data[index].GraphHeaders[a] + '</div > ';
        }
        hawk.data[index].config.html += '</div>';
        // Table data
        for (var b = 0; b < hawk.data[index].Results[resultIndex].SubResults.length; b++) {
            hawk.data[index].config.html += '<div class="row">';
            for (var c in hawk.data[index].Results[resultIndex].SubResults[b]) {
                hawk.data[index].config.html += '<div class="row-data';
                if (c != 'Label') {
                    if (parseInt(hawk.data[index].Results[resultIndex].SubResults[b][c]) < 20) {
                        hawk.data[index].config.html += ' heatmap-cell-level1';
                    } else if (parseInt(hawk.data[index].Results[resultIndex].SubResults[b][c]) < 40) {
                        hawk.data[index].config.html += ' heatmap-cell-level2';
                    } else if (parseInt(hawk.data[index].Results[resultIndex].SubResults[b][c]) < 60) {
                        hawk.data[index].config.html += ' heatmap-cell-level3';
                    } else if (parseInt(hawk.data[index].Results[resultIndex].SubResults[b][c]) > 80) {
                        hawk.data[index].config.html += ' heatmap-cell-level4';
                    }
                    hawk.data[index].config.html += '" style="width:' + ((hawk.svgWidth - 114) / hawk.data[index].GraphHeaders.length) + 'px">';
                } else {
                    hawk.data[index].config.html += '">';
                }
                hawk.data[index].config.html += hawk.data[index].Results[resultIndex].SubResults[b][c] + '</div>';
            }
            hawk.data[index].config.html += '</div>';
        }
        // Add table HTML to page
        $('.graph' + index).addClass('heatmap-table').html(hawk.data[index].config.html).width(hawk.svgWidth);
        return;
    };
    /*
     * Create site error messages list.
     * @param Int index
	 * @param Int resultIndex
     */
    hawk.createMessageList = function (index, resultIndex) {
        if (hawk.hawkDebug) { console.log('hawk.createMessageList @graphID=' + index); }
        hawk.data[index].config.html = '<div class="graph-title">' + hawk.data[index].GraphTitle + '</div>';
        for (var a = 0; a < hawk.data[index].Results[resultIndex].SubResults.length; a++) {
            hawk.data[index].config.html += '<div class="msg">';
            if (hawk.data[index].Results[resultIndex].SubResults[a].Country != undefined && hawk.data[index].Results[resultIndex].SubResults[a].Country != null && hawk.data[index].Results[resultIndex].SubResults[a].Country != '') {
                hawk.data[index].config.html += '<div class="msg-country"><div class="msg-label">Country</div><div class="msg-value">' + hawk.data[index].Results[resultIndex].SubResults[a].Country + '</div></div>';
            }
            if (hawk.data[index].Results[resultIndex].SubResults[a].Segment != undefined && hawk.data[index].Results[resultIndex].SubResults[a].Segment != null && hawk.data[index].Results[resultIndex].SubResults[a].Segment != '') {
                hawk.data[index].config.html += '<div class="msg-segment"><div class="msg-label">Segment</div><div class="msg-value">' + hawk.data[index].Results[resultIndex].SubResults[a].Segment + '</div></div>';
            }
            hawk.data[index].config.html += '<div class="msg-visitors-impacted"><div class="msg-label">Visitors Impacted</div><div class="msg-value">' + hawk.data[index].Results[resultIndex].SubResults[a].VisitorsImpacted + '</div></div>' +
                '<div class="msg-total-errors"><div class="msg-label">Total Errors</div><div class="msg-value">' + hawk.data[index].Results[resultIndex].SubResults[a].TotalErrors + '</div></div>';
            if (hawk.data[index].Results[resultIndex].SubResults[a].Message != undefined && hawk.data[index].Results[resultIndex].SubResults[a].Message != null && hawk.data[index].Results[resultIndex].SubResults[a].Message != '') {
                hawk.data[index].config.html += '<div class="msg-url">' + hawk.data[index].Results[resultIndex].SubResults[a].Message + '</div>';
            }
            hawk.data[index].config.html += '</div>';
        }
        // Add table HTML to page
        $('.graph' + index).html(hawk.data[index].config.html).width(hawk.svgWidth);
        return;
    };
	/*
     * Create comment messages.
     * @param Int index
	 * @param Int resultIndex
     */
    hawk.createCommentMessages = function (index, resultIndex) {
        if (hawk.hawkDebug) { console.log('hawk.createCommentMessages @graphID=' + index); }
        hawk.data[index].config.html = '<div class="graph-title">' + hawk.data[index].GraphTitle + '</div>';
        for (var a = 0; a < hawk.data[index].Results[resultIndex].SubResults.length; a++) {
            hawk.data[index].config.html += '<div class="msg">';
            if (hawk.data[index].Results[resultIndex].SubResults[a].Segment != undefined && hawk.data[index].Results[resultIndex].SubResults[a].Segment != null) {
                hawk.data[index].config.html += '<div class="msg-segment"><div class="msg-label">Segment</div><div class="msg-value">';
                if (parseInt(hawk.data[index].Results[resultIndex].SubResults[a].Segment) === 1) {
                    hawk.data[index].config.html += 'For Home';
                } else {
                    hawk.data[index].config.html += 'For Work';
                }
                hawk.data[index].config.html += '</div></div>';
            }
            if (hawk.data[index].Results[resultIndex].SubResults[a].Rating != undefined && hawk.data[index].Results[resultIndex].SubResults[a].Rating != null) {
                hawk.data[index].config.html += '<div class="msg-rating"><div class="msg-value ';
                if (hawk.data[index].Results[resultIndex].SubResults[a].Rating > 6) {
                    hawk.data[index].config.html += 'color-green';
                } else if (hawk.data[index].Results[resultIndex].SubResults[a].Rating > 3) {
                    hawk.data[index].config.html += 'color-yellow';
                } else {
                    hawk.data[index].config.html += 'color-red';
                }
                hawk.data[index].config.html += '">' + hawk.data[index].Results[resultIndex].SubResults[a].Rating + '</div><div class="msg-label">Rating</div></div>';
            }
            if (hawk.data[index].Results[resultIndex].SubResults[a].Country != undefined && hawk.data[index].Results[resultIndex].SubResults[a].Country != null) {
                hawk.data[index].config.html += '<div class="msg-country"><div class="msg-label">Country</div><div class="msg-value">' + hawk.data[index].Results[resultIndex].SubResults[a].Country;
                hawk.data[index].config.html += '</div></div>';
            }
            if (hawk.data[index].Results[resultIndex].SubResults[a].Time != undefined && hawk.data[index].Results[resultIndex].SubResults[a].Time != null && hawk.data[index].Results[resultIndex].SubResults[a].Time != '') {
                hawk.data[index].config.html += '<div class="msg-time"><div class="msg-value">';
                hawk.data[index].config.html += hawk.data[index].Results[resultIndex].SubResults[a].Time + '</div><div class="msg-label">Time</div></div>';
            }
            if (hawk.data[index].Results[resultIndex].SubResults[a].Message != undefined && hawk.data[index].Results[resultIndex].SubResults[a].Message != null && hawk.data[index].Results[resultIndex].SubResults[a].Message != '') {
                hawk.data[index].config.html += '<div class="msg-url">' + hawk.data[index].Results[resultIndex].SubResults[a].Message + '</div>';
            }
            hawk.data[index].config.html += '</div>';
        }
        // Add table HTML to page
        $('.graph' + index).addClass('comment-messages').html(hawk.data[index].config.html).width(hawk.svgWidth);
        return;
    };
	/*
     * Create tooltip on mouse hover above graph with data point info.
     * @param Int index
     * @param {Object} graph
     */
    hawk.graphHoverInfo = function (index, graph) {
        if (hawk.hawkDebug) { console.log('hawk.graphHoverInfo @graphID=' + index); }




    };
    /*
     * Create line graph to svg.
     * @param Int index
	 * @param Int resultIndex
     * @param {Object} graph
     */
    hawk.createLineGraph = function (index, resultIndex, graph = -1) {
        if (hawk.hawkDebug) { console.log('hawk.createLineGraph @graphID=' + index); }
        //setup
        if (graph == -1) {
            hawk.data[index].config.html = '<div class="graph-title">' + hawk.data[index].GraphTitle + '</div>' +
                '<svg class="graph"></svg>' +
                '<div class="graph-legend"></div>';
            $('.graph' + index).html(hawk.data[index].config.html).width(hawk.svgWidth);
            var graph = d3.select('.graph' + index + ' .graph')
                .attr('width', hawk.svgWidth)
                .attr('height', hawk.svgHeight)
                .append('g')
                .attr('transform', 'translate(' + hawk.graphMargins.left + ',' + hawk.graphMargins.top + ')');
            $('.graph' + index).width(hawk.svgWidth);
        }
        //calculate scales
        hawk.data[index].config.y1 = d3.scaleLinear()
            .range([hawk.data[index].config.graphHeight, 0])
            .domain([0, d3.max(hawk.data[index].Results[resultIndex].SubResults, function (d) { return parseInt(d.Line1Value); })]);
        hawk.data[index].config.xLine = d3.scaleTime()
            .rangeRound([0, hawk.data[index].config.graphWidth])
            .domain(d3.extent(hawk.data[index].Results[resultIndex].SubResults, function (d) { return d3.isoParse(d.Timestamp); }));
        //Add legend and axis
        if (hawk.data[index].GraphType == 3) {
            hawk.createLegend(index, resultIndex);
            hawk.createAxis(index, resultIndex, graph);
        }
        // LINE 1
        hawk.data[index].config.dellLines = 1;
        hawk.data[index].config.yLine = d3.scaleLinear()
            .rangeRound([hawk.data[index].config.graphHeight, 0])
            .domain([0, d3.max(hawk.data[index].Results[0].SubResults, function (d) { return parseInt(d.Line1Value); })]);
        hawk.data[index].config.line = d3.line()
            .x(function (d) { return hawk.data[index].config.xLine(d3.isoParse(d.Timestamp)); }) // x values
            .y(function (d) { return hawk.data[index].config.yLine(parseInt(d.Line1Value)); }) // y values
            .curve(d3.curveMonotoneX);
        graph.append('path')
            .attr('class', 'line')
            .style("stroke", function () {
                return hawk.colors[0];
            })
            .style('overflow', 'visible')
            .attr('d', hawk.data[index].config.line(hawk.data[index].Results[0].SubResults));
        // LINE 2
        if (hawk.data[index].Results[0].SubResults[0].Line2Value != undefined && hawk.data[index].Results[0].SubResults[0].Line2Value != null) {
            hawk.data[index].config.dellLines++;
            hawk.data[index].config.yLine2 = d3.scaleLinear()
                .rangeRound([hawk.data[index].config.graphHeight, 0])
                .domain([0, d3.max(hawk.data[index].Results[resultIndex].SubResults, function (d) { return parseInt(d.Line2Value); })]);
            hawk.data[index].config.line2 = d3.line()
                .x(function (d) { return hawk.data[index].config.xLine(d3.isoParse(d.Timestamp)); }) // x values
                .y(function (d) { return hawk.data[index].config.yLine2(parseInt(d.Line2Value)); }) // y values
                .curve(d3.curveMonotoneX);
            graph.append('path')
                //pre transition
                .attr('class', 'line')
                .style("stroke", function () {
                    return hawk.colors[1];
                })
                .attr('d', hawk.data[index].config.line2(hawk.data[index].Results[resultIndex].SubResults));
        }
        // LINE 3
        if (hawk.data[index].Results[0].SubResults[0].Line3Value != undefined && hawk.data[index].Results[0].SubResults[0].Line3Value != null) {
            hawk.data[index].config.dellLines++;
            hawk.data[index].config.yLine3 = d3.scaleLinear()
                .rangeRound([hawk.data[index].config.graphHeight, 0])
                .domain([0, d3.max(hawk.data[index].Results[resultIndex].SubResults, function (d) { return parseInt(d.Line3Value); })]);
            hawk.data[index].config.line3 = d3.line()
                .x(function (d) { return hawk.data[index].config.xLine(d3.isoParse(d.Timestamp)); }) // x values
                .y(function (d) { return hawk.data[index].config.yLine3(parseInt(d.Line3Value)); }) // y values
                .curve(d3.curveMonotoneX);
            graph.append('path')
                //pre transition
                .attr('class', 'line')
                .style("stroke", function () {
                    return hawk.colors[2];
                })
                .attr('d', hawk.data[index].config.line3(hawk.data[index].Results[resultIndex].SubResults));
        }
        // LINE 4
        if (hawk.data[index].Results[0].SubResults[0].Line4Value != undefined && hawk.data[index].Results[0].SubResults[0].Line4Value != null) {
            hawk.data[index].config.dellLines++;
            hawk.data[index].config.yLine4 = d3.scaleLinear()
                .rangeRound([hawk.data[index].config.graphHeight, 0])
                .domain([0, d3.max(hawk.data[index].Results[resultIndex].SubResults, function (d) { return parseInt(d.Line4Value); })]);
            hawk.data[index].config.line4 = d3.line()
                .x(function (d) { return hawk.data[index].config.xLine(d3.isoParse(d.Timestamp)); }) // x values
                .y(function (d) { return hawk.data[index].config.yLine4(parseInt(d.Line4Value)); }) // y values
                .curve(d3.curveMonotoneX);
            graph.append('path')
                //pre transition
                .attr('class', 'line')
                .style("stroke", function () {
                    return hawk.colors[3];
                })
                .attr('d', hawk.data[index].config.line4(hawk.data[index].Results[resultIndex].SubResults));
        }
        //tooltip info
        if (parseInt(hawk.data[index].Interactive) === 2 && hawk.data[index].GraphType !== 1) {
            var mouseG = graph.append('g')
                .attr('class', 'mouse-over-effects');
            //black vertical line to follow mouse
            mouseG.append('path')
                .attr('class', 'mouse-line')
                .style('stroke', 'black')
                .style('stroke-width', '1px')
                .style('opacity', '0');
            hawk.data[index].config.lines = document.querySelectorAll('.graph' + index + ' .line');
            var mousePerLine = mouseG.selectAll('.graph' + index + ' .mouse-per-line')
                .data(hawk.data[index].Results[0].SubResults)
                .enter()
                .append('g')
                .attr('class', 'mouse-per-line');
            mousePerLine.append('circle')
                .attr('r', 7)
                .style('stroke', function (d) {
                    return hawk.colors[0]; //color(d.name);
                })
                .style('fill', 'none')
                .style('stroke-width', '1px')
                .style('opacity', '0');
            mousePerLine.append('text')
                .attr('transform', 'translate(10,3)');
            var touchGraph = function () {
                // on mouse in show line, circles and text
                d3.select('.graph' + index + ' .mouse-line')
                    .style('opacity', '1');
                d3.selectAll('.graph' + index + ' .mouse-per-line circle')
                    .style('opacity', '1');
                d3.selectAll('.graph' + index + ' .mouse-per-line text')
                    .style('opacity', '1')
                    .style('background', '#fff');
            }
            mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
                .attr('width', hawk.data[index].config.graphWidth) // can't catch mouse events on a g element
                .attr('height', hawk.data[index].config.graphHeight)
                .attr('fill', 'none')
                .attr('pointer-events', 'all')
                .on('mouseout', function () { // on mouse out hide line, circles and text
                    d3.select('.graph' + index + ' .mouse-line')
                        .style('opacity', '0');
                    d3.selectAll('.graph' + index + ' .mouse-per-line circle')
                        .style('opacity', '0');
                    d3.selectAll('.graph' + index + ' .mouse-per-line text')
                        .style('opacity', '0');
                })
                .on('mouseover', touchGraph)
                .on('touchmove', touchGraph)
                .on('mousemove', function () { // mouse moving over canvas
                    var mouse = d3.mouse(this);
                    d3.select('.graph' + index + ' .mouse-line')
                        .attr('d', function () {
                            var d = 'M' + mouse[0] + ',' + hawk.data[index].config.graphHeight;
                            d += ' ' + mouse[0] + ',' + 0;
                            return d;
                        });
                    d3.selectAll('.graph' + index + ' .mouse-per-line')
                        .attr('transform', function (d, i) {
                            if (i < hawk.data[index].config.dellLines) {
                                var xDate = hawk.data[index].config.xLine.invert(mouse[0]),
                                    bisect = d3.bisector(function (d) { return d.Timestamp; }).right,
                                    idx = bisect(d.Line1Value, xDate),
                                    beginning = 0,
                                    end = hawk.data[index].config.lines[i].getTotalLength(),
                                    target = null;
                                while (true) {
                                    target = Math.floor((beginning + end) / 2);
                                    pos = hawk.data[index].config.lines[i].getPointAtLength(target);
                                    if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                                        break;
                                    }
                                    if (pos.x > mouse[0]) {
                                        end = target;
                                    } else if (pos.x < mouse[0]) {
                                        beginning = target;
                                    } else {
                                        break; //position found
                                    }
                                }
                                d3.select(this).select('text')
                                    .attr('class', 'dell-tooltip')
                                    .text(hawk.data[index].config.yLine.invert(pos.y).toFixed(2));
                                return 'translate(' + mouse[0] + ',' + pos.y + ')';
                            }
                        });
                });
        }
        return;
    };
    /*
     * Create multi color line graph to svg.
     * @param Int index
	 * @param Int resultIndex
     */
    hawk.createMultiColorLineGraph = function (index, resultIndex) {
        if (hawk.hawkDebug) { console.log('hawk.createMultiColorLineGraph @graphID=' + index + ' @GraphType=' + hawk.data[index].GraphType); }
        //setup
        hawk.data[index].config.html = '<div class="graph-title">' + hawk.data[index].GraphTitle + '</div>' +
            '<svg class="graph"></svg>' +
            '<div class="graph-details"></div>' +
            '<div class="graph-legend"></div>';
        $('.graph' + index).html(hawk.data[index].config.html).width(hawk.svgWidth);
        var graph = d3.select('.graph' + index + ' .graph')
            .attr('width', hawk.svgWidth)
            .attr('height', hawk.svgHeight)
            .append('g')
            .attr('transform', 'translate(' + hawk.graphMargins.left + ',' + hawk.graphMargins.top + ')');
        //calculate scales
        hawk.data[index].config.min = (Math.round(d3.min(hawk.data[index].Results[resultIndex].SubResults, function (d) { return parseInt(d.Line1Percentage); }) / 10) * 10) - 10;
        if (hawk.data[index].config.min < 0) {
            hawk.data[index].config.min = 0;
        }
        hawk.data[index].config.xLine = d3.scaleTime()
            .rangeRound([0, hawk.data[index].config.graphWidth])
            .domain(d3.extent(hawk.data[index].Results[resultIndex].SubResults, function (d) { return d3.isoParse(d.Timestamp); }));
        hawk.data[index].config.yLine = d3.scaleLinear()
            .rangeRound([hawk.data[index].config.graphHeight, 0])
            .domain([hawk.data[index].config.min, d3.max(hawk.data[index].Results[resultIndex].SubResults, function (d) { return parseInt(d.Line1Percentage); })]);
        //Add legend and axis
        hawk.createLegend(index, resultIndex);
        hawk.createAxis(index, resultIndex, graph);
        //line
        hawk.data[index].config.line = d3.line()
            .x(function (d) { return hawk.data[index].config.xLine(d3.isoParse(d.Timestamp)); }) // x values
            .y(function (d) { return hawk.data[index].config.yLine(parseInt(d.Line1Percentage)); }) // y values
            .curve(d3.curveMonotoneX);
        graph.append("linearGradient")
            .attr("id", ("line-gradient" + index))
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", hawk.data[index].config.yLine(0))
            .attr("x2", 0).attr("y2", hawk.data[index].config.yLine(100))
            .selectAll("stop")
            .data(hawk.data[index].GraphColorRanges)
            .enter().append("stop")
            .attr("offset", function (d) { return d.Offset; })
            .attr("stop-color", function (d) { return d.Color; });
        graph.append('path')
            .attr('class', ('colorful-line' + index))
            .attr('fill', 'none')
            .attr('stroke', ('url(#line-gradient' + index + ')'))
            .attr('stroke-width', '2px')
            .attr('d', hawk.data[index].config.line(hawk.data[index].Results[resultIndex].SubResults));
        //detailed info expansion
        hawk.detailedInfo(index);
        return;
    };
    /*
     * Create overview line item.
     * @param Int index
	 * @param Int resultIndex
     */
    hawk.createOverviewLineItem = function (index, resultIndex) {
        if (hawk.hawkDebug) { console.log('hawk.createMultiColorLineGraph @graphID=' + index); }
        //setup
        hawk.data[index].config.html = '<div class="graph-title-gt14">' + hawk.data[index].GraphTitle + '</div>' +
            '<svg class="graph"></svg>' +
            '<div class="graph-number-gt14" style="color:' + hawk.data[index].Color + '">' + hawk.data[index].GraphNumber + '</div>';
        $('.graph' + index).addClass('gt14').html(hawk.data[index].config.html).width(hawk.svgWidth);
        hawk.data[index].config.graphHeight = 40;
        hawk.data[index].config.graphWidth = (hawk.svgWidth - 90);
        var graph = d3.select('.graph' + index + ' .graph')
            .attr('width', hawk.data[index].config.graphWidth)
            .attr('height', hawk.data[index].config.graphHeight)
            .append('g')
            .attr('transform', 'translate(0,0)');
        //calculate scales
        hawk.data[index].config.min = (Math.round(d3.min(hawk.data[index].Results[resultIndex].SubResults, function (d) { return parseInt(d.Line1Value); }) / 10) * 10) - 10;
        if (hawk.data[index].config.min < 0) {
            hawk.data[index].config.min = 0;
        }
        hawk.data[index].config.xLine = d3.scaleTime()
            .rangeRound([0, hawk.data[index].config.graphWidth])
            .domain(d3.extent(hawk.data[index].Results[resultIndex].SubResults, function (d) { return d3.isoParse(d.Timestamp); }));
        hawk.data[index].config.yLine = d3.scaleLinear()
            .rangeRound([hawk.data[index].config.graphHeight, 0])
            .domain([hawk.data[index].config.min, d3.max(hawk.data[index].Results[resultIndex].SubResults, function (d) { return parseInt(d.Line1Value); })]);
        //line
        hawk.data[index].config.line = d3.line()
            .x(function (d) { return hawk.data[index].config.xLine(d3.isoParse(d.Timestamp)); }) // x values
            .y(function (d) { return hawk.data[index].config.yLine(parseInt(d.Line1Value)); }) // y values
            .curve(d3.curveMonotoneX);
        graph.append("linearGradient")
            .attr("id", ("line-gradient" + index))
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", hawk.data[index].config.yLine(0))
            .attr("x2", 0).attr("y2", hawk.data[index].config.yLine(100))
            .selectAll("stop")
            .data(hawk.data[index].GraphColorRanges)
            .enter().append("stop")
            .attr("offset", function (d) { return d.Offset; })
            .attr("stop-color", function (d) { return d.Color; });
        graph.append('path')
            .attr('class', ('colorful-line' + index))
            .attr('fill', 'none')
            .attr('stroke', ('url(#line-gradient' + index + ')'))
            .attr('stroke-width', '2px')
            .attr('d', hawk.data[index].config.line(hawk.data[index].Results[resultIndex].SubResults));
        return;
    };
    /*
     * Create graph gridlines to svg.
     * @param Int index
     * @param {Object} graph
     */
    hawk.createGridlines = function (index, graph) {
        // Add X gridlines
        hawk.data[index].config.make_x_gridlines = function () {
            return d3.axisBottom(hawk.data[index].config.x).ticks(5);
        }
        graph.append('g')
            .attr('class', 'grid')
            .attr('transform', 'translate(0,' + hawk.data[index].config.graphHeight + ')')
            .call(hawk.data[index].config.make_x_gridlines()
                .tickSize(-hawk.data[index].config.graphHeight)
                .tickFormat('')
            );
        // Add Y gridlines
        hawk.data[index].config.make_y_gridlines = function () {
            return d3.axisLeft(hawk.data[index].config.y1).ticks(5);
        }
        graph.append('g')
            .attr('class', 'grid')
            .call(hawk.data[index].config.make_y_gridlines()
                .tickSize(-hawk.data[index].config.graphWidth)
                .tickFormat('')
            );
    };
    /*
     * Create graph axis to svg.
     * @param Int index
     * @param Int resultIndex
     * @param {Object} graph
     */
    hawk.createAxis = function (index, resultIndex, graph) {
        if (hawk.hawkDebug) { console.log('hawk.createAxis @graphID=' + index); }
        // Add X Axis
        hawk.data[index].config.x = d3.scaleTime()
            .range([0, hawk.data[index].config.graphWidth])
            .domain([hawk.data[index].config.startTime, hawk.data[index].config.endTime]);
        graph.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + hawk.data[index].config.graphHeight + ')')
            .call(d3.axisBottom(hawk.data[index].config.x).ticks(5));
        // Add Y1 Axis
        if (hawk.data[index].GraphType === 1 || hawk.data[index].GraphType === 2 || hawk.data[index].GraphType === 3) {
            graph.append('g')
                .attr('class', 'axis')
                .call(d3.axisLeft(hawk.data[index].config.y1).ticks(4).tickFormat(function (d) { return hawk.formatNumber(d) }))
                .append('text')
                .attr('transform', 'rotate(-90)')
                .attr('x', (hawk.data[index].config.graphHeight * -1))
                .attr('y', -40)
                .attr('dy', '0.71em')
                .attr('text-anchor', 'end')
                .text(hawk.data[index].GraphY1AxisLabel);
        } else if (hawk.data[index].GraphType === 7) {
            graph.append('g')
                .attr('class', 'axis')
                .call(d3.axisLeft(hawk.data[index].config.y1).ticks(4).tickFormat(function (d) { return hawk.formatNumber(d) }));
        } else if (hawk.data[index].GraphType === 13) {
            hawk.data[index].config.y1 = d3.scaleLinear()
                .range([hawk.data[index].config.graphHeight, 0])
                .domain([hawk.data[index].config.min, d3.max(hawk.data[index].Results[resultIndex].SubResults, function (d) { return parseInt(d.Line1Value); })]);
            /*graph.append('g')
                .attr('class', 'axis')
                .call(d3.axisLeft(hawk.data[index].config.y1).tickValues([60, 70, 80, 90, 100]).tickFormat(function (d) { return d + "%"; }));*/
        }
        // Add Y2 Axis
        hawk.data[index].config.y2 = d3.scaleLinear()
            .range([hawk.data[index].config.graphHeight, 0])
            .domain([0, d3.max(hawk.data[index].Results[resultIndex].SubResults, function (d) { return parseInt(d.Line1Value); })]);
        if (hawk.data[index].GraphType === 1) {
            graph.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + hawk.data[index].config.graphWidth + ',0)')
                .call(d3.axisRight(hawk.data[index].config.y2).ticks(3))
                .append('text')
                .attr('transform', 'rotate(90)')
                .attr('x', (hawk.data[index].config.graphHeight + 15))
                .attr('y', -40)
                .attr('dy', '0.71em')
                .attr('text-anchor', 'end')
                .text(hawk.data[index].GraphY2AxisLabel);
        }
        hawk.createGridlines(index, graph);
        return;
    };
    /*
     * Create bar graph to svg.
     * @param Int index
	 * @param Int resultIndex
     */
    hawk.createBarGraph = function (index, resultIndex) {
        if (hawk.hawkDebug) { console.log('hawk.createBarGraph @graphID=' + index); }
        // check GraphColor is not null
        if (hawk.data[index].GraphColor == "") {
            hawk.data[index].GraphColor = hawk.colors[4];
            var GraphFontColor = hawk.colors[9];
        } else {
            GraphFontColor = hawk.data[index].GraphColor;
        }
        //setup
        hawk.data[index].config.html = '<div class="graph-title graph-title-short">' + hawk.data[index].GraphTitle + '</div>' +
            '<div class="graph-status">' +
            '<div class="graph-status-value" style="display:none;color:' + GraphFontColor + '">' + hawk.data[index].GraphNumber + '</div>' +
            '<div class="graph-status-label" style="display:none">Customers Impacted</div></div>' +
            '<svg class="graph"></svg>' +
            '<div class="graph-legend"></div>';
        $('.graph' + index).html(hawk.data[index].config.html).width(hawk.svgWidth);
        var graph = d3.select('.graph' + index + ' .graph')
            .attr('width', hawk.svgWidth)
            .attr('height', hawk.svgHeight)
            .append('g')
            .attr('transform', 'translate(' + hawk.graphMargins.left + ',' + hawk.graphMargins.top + ')');
        $('.graph' + index).width(hawk.svgWidth);
        //calculate scales
        hawk.data[index].config.xScale = d3.scaleBand()
            .rangeRound([0, hawk.data[index].config.graphWidth])
            .padding(0.1)
            .domain(hawk.data[index].Results[resultIndex].SubResults.map(function (d) { return d3.isoParse(d.Timestamp); }));
        hawk.data[index].config.yScale = d3.scaleLinear()
            .rangeRound([hawk.data[index].config.graphHeight, 0])
            .domain([0, d3.max(hawk.data[index].Results[resultIndex].SubResults, function (d) { return parseInt(d.BarGraphValue); })]);
        //Add legend and axis
        hawk.createLegend(index, resultIndex);
        hawk.createAxis(index, resultIndex, graph);
        // Add bar graph
        graph.selectAll('.bar')
            .data(hawk.data[index].Results[resultIndex].SubResults)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('width', hawk.data[index].config.xScale.bandwidth())
            .style('fill', hawk.data[index].GraphColor)
            //pre transition
            .attr('x', function (d) { return hawk.data[index].config.xScale(d3.isoParse(d.Timestamp)); })
            .attr('y', hawk.data[index].config.graphHeight)
            .attr('height', 0)
            //post transition
            .transition()
            .delay(function (d, i) { return i * 50; })
            .attr('x', function (d) { return hawk.data[index].config.xScale(d3.isoParse(d.Timestamp)); })
            .attr('y', function (d) { return hawk.data[index].config.yScale(parseInt(d.BarGraphValue)); })
            .attr('height', function (d) { return hawk.data[index].config.graphHeight - hawk.data[index].config.yScale(parseInt(d.BarGraphValue)); });
        // Add listener for user clicking on graph as link to another page
        hawk.graphLinkOut(index);
        return;
    };
    /*
     * Create Graph Type 7 = bar & line graph.
     * @param Int index
	 * @param Int resultIndex
     */
    hawk.createGraphType7 = function (index, resultIndex) {
        if (hawk.hawkDebug) { console.log('hawk.createBarGraph @graphID=' + index); }
        hawk.data[index].config.html = '<div class="graph-title">' +
            '<div class="graph-title">' + hawk.data[index].GraphTitle + '</div></div>' +
            '<svg class="graph"></svg>' +
            '<div class="graph-legend"></div>';
        $('.graph' + index).html(hawk.data[index].config.html).width(hawk.svgWidth);
        graph = d3.select('.graph' + index + ' .graph')
            .attr('width', hawk.svgWidth)
            .attr('height', hawk.svgHeight)
            .append('g')
            .attr('transform', 'translate(' + hawk.graphMargins.left + ',' + hawk.graphMargins.top + ')');
        //calculate scales
        hawk.data[index].config.xScale = d3.scaleBand()
            .rangeRound([0, hawk.data[index].config.graphWidth])
            .padding(0.1)
            .domain(hawk.data[index].Results[resultIndex].SubResults.map(function (d) { return d3.isoParse(d.Timestamp); }));
        hawk.data[index].config.yScale = d3.scaleLinear()
            .rangeRound([hawk.data[index].config.graphHeight, 0])
            .domain([0, d3.max(hawk.data[index].Results[resultIndex].SubResults, function (d) { return parseInt(d.BarGraphValue); })]);
        hawk.data[index].config.xLine = d3.scaleTime()
            .rangeRound([0, hawk.data[index].config.graphWidth])
            .domain(d3.extent(hawk.data[index].Results[resultIndex].SubResults, function (d) { return d3.isoParse(d.Timestamp); }));
        hawk.data[index].config.yLine = d3.scaleLinear()
            .rangeRound([hawk.data[index].config.graphHeight, 0])
            .domain([0, d3.max(hawk.data[index].Results[resultIndex].SubResults, function (d) { return parseInt(d.Line1Value); })]);
        // Add X Axis
        hawk.data[index].config.x = d3.scaleTime()
            .range([0, hawk.data[index].config.graphWidth])
            .domain([hawk.data[index].config.startTime, hawk.data[index].config.endTime]);
        // Add Y1 axis
        hawk.data[index].config.y1 = d3.scaleLinear()
            .range([hawk.data[index].config.graphHeight, 0])
            .domain([0, d3.max(hawk.data[index].Results[resultIndex].SubResults, function (d) { return parseInt(d.BarGraphValue); })]);
        // Add legend
        hawk.createAxis(index, resultIndex, graph);
        hawk.createLegend(index, resultIndex);
        // Add bar graph
        graph.selectAll('.bar')
            .data(hawk.data[index].Results[resultIndex].SubResults)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('width', hawk.data[index].config.xScale.bandwidth())
            .style('fill', '#41B6E6')
            //pre transition
            .attr('x', function (d) { return hawk.data[index].config.xScale(d3.isoParse(d.Timestamp)); })
            .attr('y', hawk.data[index].config.graphHeight)
            .attr('height', 0)
            //post transition
            .transition()
            .delay(function (d, i) { return i * 50; })
            .attr('x', function (d) { return hawk.data[index].config.xScale(d3.isoParse(d.Timestamp)); })
            .attr('y', function (d) { return hawk.data[index].config.yScale(parseInt(d.BarGraphValue)); })
            .attr('height', function (d) { return hawk.data[index].config.graphHeight - hawk.data[index].config.yScale(parseInt(d.BarGraphValue)); });
        // Add line graph
        hawk.data[index].config.preline = d3.line()
            .x(function () { return hawk.data[index].config.xLine(hawk.data[index].config.startTime); }) // x values
            .y(function () { return hawk.data[index].config.yLine(0); }); // y values
        hawk.data[index].config.line = d3.line()
            .x(function (d) { return hawk.data[index].config.xLine(d3.isoParse(d.Timestamp)); }) // x values
            .y(function (d) { return hawk.data[index].config.yLine(parseInt(d.Line1Value)); }) // y values
            .curve(d3.curveMonotoneX);
        graph.append('path')
            //pre transition
            .attr('class', 'line')
            .attr('d', hawk.data[index].config.preline(hawk.data[index].Results[resultIndex].SubResults))
            //post transition
            .transition()
            .attr('d', hawk.data[index].config.line(hawk.data[index].Results[resultIndex].SubResults));
        // Add listener for user clicking on graph as link to another page
        hawk.graphLinkOut(index);
        return;
    };
    /*
     * Create stacked bar graph to svg that shows numbers for three error types.
     * @param Int index
	 * @param Int resultIndex
     */
    hawk.createStackedBarGraph = function (index, resultIndex) {
        if (hawk.hawkDebug) { console.log('hawk.createStackedBarGraph @graphID=' + index + ' @svgwidth=' + hawk.svgWidth); }
        var graph;
        //text for graph container
        hawk.data[index].config.date = new Date(hawk.data[index].Results[resultIndex].SubResults[0].Timestamp).toDateString();
        hawk.data[index].config.html = '<div class="graph-title graph-title-large">' + hawk.data[index].GraphTitle + '</div>' +
            '<div class="graph-status">' +
            '<div class="graph-status-value"></div>' +
            '<div class="graph-status-label"></div></div>' +
            '<svg class="graph"></svg>' +
            '<div class="graph-details"></div>' +
            '<div class="graph-legend"></div>';
        $('.graph' + index).html(hawk.data[index].config.html).width(hawk.svgWidth);
        $('.graph' + index + ' .graph-status-value').html(hawk.data[index].GraphNumber);
        $('.graph' + index + ' .graph-status-label').html(hawk.data[index].GraphNumberLabel);
        graph = d3.select('.graph' + index + ' .graph')
            .attr('width', hawk.svgWidth)
            .attr('height', hawk.svgHeight)
            .append('g')
            .attr('transform', 'translate(' + hawk.graphMargins.left + ',' + hawk.graphMargins.top + ')');
        //keys = headers of data that makes up stacked bars
        hawk.data[index].config.keys = ['StackedBar1Value', 'StackedBar2Value', 'StackedBar3Value', 'StackedBar4Value'];
        //calculate scales
        hawk.data[index].config.layers = d3.stack()
            .keys(hawk.data[index].config.keys)(hawk.data[index].Results[resultIndex].SubResults);
        hawk.data[index].config.xScale = d3.scaleBand()
            .rangeRound([0, hawk.data[index].config.graphWidth])
            .padding(0.1)
            .domain(hawk.data[index].Results[resultIndex].SubResults.map(function (d) { return d3.isoParse(d.Timestamp); }));
        hawk.data[index].config.yScale = d3.scaleLinear()
            .rangeRound([hawk.data[index].config.graphHeight, 0])
            .domain([0, d3.max(hawk.data[index].config.layers[hawk.data[index].config.layers.length - 1], function (d) { return parseInt(d[0]) + parseInt(d[1]); })]).nice();
        hawk.data[index].config.zScale = d3.scaleOrdinal()
            .range(['#D93F3C', '#F7BC38', '#0076CE', '#65A637'])
            .domain(hawk.data[index].config.keys);
        hawk.data[index].config.y1 = d3.scaleLinear()
            .range([hawk.data[index].config.graphHeight, 0])
            .domain([0, d3.max(hawk.data[index].Results[resultIndex].SubResults, function (d) { return parseInt(d.StackedBarTotal); })]);
        //Add legend and axis
        hawk.createLegend(index, resultIndex);
        hawk.createAxis(index, resultIndex, graph);
        //Add stacked bar graph
        var layer = graph.selectAll('layer')
            .data(hawk.data[index].config.layers)
            .enter()
            .append('g')
            .attr('class', 'layer')
            .style('fill', function (d, i) { return hawk.data[index].config.zScale(i); });
        layer.selectAll('rect')
            .data(d => d)
            .enter()
            .append('rect')
            .attr('width', hawk.data[index].config.xScale.bandwidth())
            //pre transition
            .attr('x', function (d) { return hawk.data[index].config.xScale(d3.isoParse(d.data.Timestamp)); })
            .attr('y', hawk.data[index].config.graphHeight)
            .attr('height', 0)
            //post transition
            .transition()
            .delay(function (d, i) { return i * 30; })
            .attr('x', function (d, i) { return hawk.data[index].config.xScale(d3.isoParse(d.data.Timestamp)); })
            .attr('y', function (d) { return hawk.data[index].config.yScale(parseInt(d[0]) + parseInt(d[1])); })
            .attr('height', function (d) { return hawk.data[index].config.yScale(parseInt(d[0])) - hawk.data[index].config.yScale(parseInt(d[1]) + parseInt(d[0])); });
        //detailed info expansion
        hawk.detailedInfo(index);
        // Add listener for user clicking on graph as link to another page
        //hawk.graphLinkOut(index);
        hawk.createLineGraph(index, resultIndex, graph);
        return;
    };
	/*
	 * Setup information panel below graph to scroll through data points.
	 * @param Int index
	 */
    hawk.detailedInfo = function (index) {
        if (hawk.hawkDebug) { console.log('hawk.detailedInfo @SETUP @graphID=' + index + ' @GraphType=' + hawk.data[index].GraphType); }
        var html = '',
            htmlData = '',
            htmlContainer = '<div class="graph-details-slider"></div>' +
                '<div class="graph-details-result"></div>',
            dataPoints = hawk.data[index].Results[0].SubResults.length;
        $('.graph' + index + ' .button-graph-details-expand').click(function () {
            if (hawk.hawkDebug) { console.log('hawk.detailedInfo @clickedInfoButton @graphID=' + index); }
            $('.graph' + index + ' .graph-details').html(htmlContainer);
            $('.graph' + index + ' .graph-details-slider').width(hawk.data[index].config.graphWidth).slider({
                change: function (event, ui) {
                    if (hawk.hawkDebug) { console.log('hawk.detailedInfo @DEBUG @graphID=' + index + ' @GraphType=' + hawk.data[index].GraphType); }
                    var sliderPosition = $('.graph-details-slider').slider('option', 'value'),
                        fraction = dataPoints / 100,
                        dataPointIndex = Math.floor(sliderPosition * fraction) - 1;
                    if (dataPointIndex < 0) { dataPointIndex = 0; }
                    htmlData = '<div class="graph-details-result-date">' + hawk.data[index].Results[0].SubResults[dataPointIndex].Timestamp + '</div>';
                    $('.graph' + index + ' .graph-details-result').html(htmlData);
                    if (hawk.data[index].GraphType === 13) {
                        if (hawk.hawkDebug) { console.log('hawk.detailedInfo @showData @graphID=' + index + ' @GraphType=' + hawk.data[index].GraphType); }
                        html = '<div class="graph-legend-element"><div class="graph-legend-element-label">Value</div><div class="data-point-info">' + hawk.data[index].Results[0].SubResults[dataPointIndex].Line1Value + '</div></div>';
                        for (var i = 0; i < hawk.data[index].GraphLegend.length; i++) {
                            html += '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-line" style="background:' + hawk.data[index].colors[i] + '"></div>' +
                                '<div class="graph-legend-element-label">' + hawk.data[index].GraphLegend[i] + '</div></div>';
                        }
                    } else if (hawk.data[index].GraphType === 1) {
                        if (hawk.hawkDebug) { console.log('hawk.detailedInfo @showData @graphID=' + index + ' @GraphType=' + hawk.data[index].GraphType); }
                        html = '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-line"></div><div class="graph-legend-element-label">perc 95</div><div class="data-point-info">' + hawk.data[index].Results[0].SubResults[dataPointIndex].Line1Value + '</div></div>' +
                            '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-color-5xx"></div><div class="graph-legend-element-label">5XX</div><div class="data-point-info">' + hawk.data[index].Results[0].SubResults[dataPointIndex].StackedBar1Value + '</div></div>' +
                            '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-color-4xx"></div><div class="graph-legend-element-label">4XX</div><div class="data-point-info">' + hawk.data[index].Results[0].SubResults[dataPointIndex].StackedBar2Value + '</div></div>';
                        if (hawk.get3xxCount(index) > 0) {
                            html += '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-color-3xx"></div><div class="graph-legend-element-label">3XX</div><div class="data-point-info">' + hawk.data[index].Results[0].SubResults[dataPointIndex].StackedBar3Value + '</div></div>';
                        }
                        html += '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-color-2xx"></div><div class="graph-legend-element-label">2XX</div><div class="data-point-info">' + hawk.data[index].Results[0].SubResults[dataPointIndex].StackedBar4Value + '</div></div>';
                    }
                    $('.graph' + index + ' .graph-legend').html(html);
                }
            });
            $('.graph' + index + ' .graph-details-slider').slider('value', 0);
        });
    };
    /*
     * Create legend to graph.
     * @param Int index - graph dataset
     * @param Int index2 - result set
     */
    hawk.createLegend = function (index, index2 = 0, colors) {
        if (hawk.hawkDebug) { console.log('hawk.createLegend @graphID=' + index); }

        var html = '';
        if (hawk.data[index].GraphType === 1) {
            if (parseInt(hawk.data[index].Interactive) === 1) {
                html += '<img alt="binoculars expand graph details" class="button-graph-details-expand" src="./binoculars.svg" /></div>';
            }
            html += '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-line"></div><div class="graph-legend-element-label">perc 95</div></div>' +
                '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-color-5xx"></div><div class="graph-legend-element-label">5XX</div></div>' +
                '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-color-4xx"></div><div class="graph-legend-element-label">4XX</div></div>';
            if (hawk.get3xxCount(index) > 0) {
                html += '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-color-3xx"></div><div class="graph-legend-element-label">3XX</div></div>';
            }
            html += '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-color-2xx"></div><div class="graph-legend-element-label">2XX</div></div>';
        } else if (hawk.data[index].GraphType === 2) {
            html = '<div class="graph-legend-element"><div class="graph-legend-element-color" style="display:none;background:' + hawk.data[index].GraphColor + '"></div><div style="display:none;" class="graph-legend-element-label">Errors</div></div>';
        } else if (hawk.data[index].GraphType === 3) {
            for (var i = 0; i < hawk.data[index].GraphLegend.length; i++) {
                html += '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-line" style="background:' + hawk.colors[i] + '"></div>' +
                    '<div class="graph-legend-element-label">' + hawk.data[index].GraphLegend[i] + '</div></div>';
            }
        } else if (hawk.data[index].GraphType === 4) {
            if (colors === null || colors === undefined || colors === '')
                colors = hawk.colors;

            for (var i = 0; i < hawk.data[index].Results[index2].SubResults.length; i++) {
                html += '<div class="graph-legend-element">' +
                    '<div class="graph-legend-element-color" style="background:' + colors[i] + '"></div> ' +
                    '<div class="graph-legend-element-label-count" style="color:' + colors[i] + '">' + hawk.data[index].Results[index2].SubResults[i].Value + '</div> ' +
                    '<div class="graph-legend-element-label">' + hawk.data[index].Results[index2].SubResults[i].Label + '</div></div> ';
            }
        } else if (hawk.data[index].GraphType === 7) {
            html = '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-line"></div><div class="graph-legend-element-label">Average</div></div>' +
                '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-color-totals"></div><div class="graph-legend-element-label">Total</div></div>';
        } else if (hawk.data[index].GraphType === 13) {
            if (parseInt(hawk.data[index].Interactive) === 1) {
                html += '<img alt="binoculars expand graph details" class="button-graph-details-expand" src="./binoculars.svg" /></div>';
            }
            hawk.data[index].colors = [];
            for (var i = 0; i < hawk.data[index].GraphColorRanges.length; i++) {
                if (i % 2 === 0) {
                    hawk.data[index].colors.push(hawk.data[index].GraphColorRanges[i].Color);
                }
            }
            console.log('colors', hawk.data[index].colors);
            for (var i = 0; i < hawk.data[index].GraphLegend.length; i++) {
                html += '<div class="graph-legend-element"><div class="graph-legend-element-color graph-legend-element-line" style="background:' + hawk.data[index].colors[i] + '"></div>' +
                    '<div class="graph-legend-element-label">' + hawk.data[index].GraphLegend[i] + '</div></div>';
            }
        }
        $('.graph' + index + ' .graph-legend').html(html);
        return;
    };
	/*
     * Listener for user click on graph which will redirect page to new URL.
     * @param Int index
     */
    hawk.graphLinkOut = function (index) {
        if (hawk.data[index].GraphLink != undefined && hawk.data[index].GraphLink != null && hawk.data[index].GraphLink != '') {
            $('.graph' + index).off('click').click(function () {
                window.location = hawk.data[index].GraphLink;
            });
        }
    };
    /*
     * Redraw graphs on screen.
     * @param Int index
     */
    hawk.redrawGraph = function (index) {
        var resultIndex = hawk.filterDataForGraph(index),
            graphLabel = '';
        switch (hawk.data[index].GraphType) {
            case 1:
                if (resultIndex === -1) {
                    graphLabel = 'Stacked Bar Graph';
                } else {
                    hawk.createStackedBarGraph(index, resultIndex);
                }
                break;
            case 2:
                if (resultIndex === -1) {
                    graphLabel = 'Bar Graph';
                } else {
                    hawk.data[index].config.y1 = d3.scaleLinear()
                        .range([hawk.data[index].config.graphHeight, 0])
                        .domain([0, d3.max(hawk.data[index].Results[resultIndex].SubResults, function (d) { return parseInt(d.BarGraphValue); })]);
                    hawk.createBarGraph(index, resultIndex);
                }
                break;
            case 3:
                if (resultIndex === -1) {
                    graphLabel = 'Line Graph';
                } else {
                    hawk.createLineGraph(index, resultIndex);
                }
                break;
            case 4:
                if (resultIndex === -1) {
                    graphLabel = 'Pie Graph';
                } else {
                    hawk.createPieGraph(index, resultIndex);
                    hawk.thresholdsMsg = 2;
                }
                break;
            case 5:
                if (resultIndex === -1) {
                    graphLabel = 'Funnel Graph';
                } else {
                    hawk.createFunnelGraph(index, resultIndex);
                    hawk.thresholdsMsg = 2;
                }
                break;
            case 6:
                if (resultIndex === -1) {
                    graphLabel = 'Sales Data Table';
                } else {
                    hawk.createSalesTable(index, resultIndex);
                }
                break;
            case 7:
                if (resultIndex === -1) {
                    graphLabel = 'Bar & Line Graph';
                } else {
                    hawk.createGraphType7(index, resultIndex);
                }
                break;
            case 9:
                if (resultIndex === -1) {
                    graphLabel = 'Heat Map';
                } else {
                    hawk.createHeatMap(index, resultIndex);
                }
                break;
            case 10:
                if (resultIndex === -1) {
                    graphLabel = 'Error Message List';
                } else {
                    hawk.createMessageList(index, resultIndex);
                }
                break;
            case 11:
                if (resultIndex === -1) {
                    graphLabel = 'Speed Data Table';
                } else {
                    hawk.createSpeedTable(index, resultIndex);
                }
                break;
            case 12:
                if (resultIndex === -1) {
                    graphLabel = 'Standard Data Table';
                } else {
                    hawk.createStandardTable(index, resultIndex);
                }
                break;
            case 13:
                if (resultIndex === -1) {
                    graphLabel = 'Multi Color Line Graph';
                } else {
                    hawk.createMultiColorLineGraph(index, resultIndex);
                }
                break;
            case 14:
                if (resultIndex === -1) {
                    graphLabel = 'Overview Line Item';
                } else {
                    hawk.createOverviewLineItem(index, resultIndex);
                }
                break;
            case 15:
                if (resultIndex === -1) {
                    graphLabel = 'Comment Messages';
                } else {
                    hawk.createCommentMessages(index, resultIndex);
                }
                break;
        }
        if (resultIndex === -1) {
            $('.graph' + index).html(graphLabel + '. No data for current filter selection.');
        }
    };
    /*
     * Create config and graph
     * @param Int index
     */
    hawk.createGraph = function (index) {
        if (hawk.existingGraphTypes.indexOf(hawk.data[index].GraphType) === -1) {
            hawk.existingGraphTypes.push(hawk.data[index].GraphType);
        }
        hawk.data[index].config = {};
        hawk.data[index].config.graphWidth = hawk.svgWidth - hawk.graphMargins.left - hawk.graphMargins.right;
        hawk.data[index].config.graphHeight = hawk.svgHeight - hawk.graphMargins.top - hawk.graphMargins.bottom;
        if (hawk.data[index].Results[0].SubResults[0].Timestamp != undefined || hawk.data[index].Results[0].SubResults[0].Timestamp != null) {
            //start and end time for X axis scale
            hawk.data[index].config.startTime = d3.isoParse(hawk.data[index].Results[0].SubResults[0].Timestamp);
            hawk.data[index].config.endTime = d3.isoParse(hawk.data[index].Results[0].SubResults[(hawk.data[index].Results[0].SubResults.length - 1)].Timestamp);
        }
        // Draw for the first time to initialize.
        hawk.redrawGraph(index);
    };
    /*
     * Validate graph dataset is valid or show error message in graph placeholder
     * @param Int index
     */
    hawk.validateGraphData = function (index) {
        var valid = true,
            html = 'Error: Invalid Data.',
            html2 = 'No Data';
        if (hawk.data[index].GraphType == undefined || hawk.data[index].GraphType == null || isNaN(parseInt(hawk.data[index].GraphType))) {
            valid = false;
            html += ' No graph type set.';
        } else if (hawk.data[index].Results == undefined || hawk.data[index].Results == null || !Array.isArray(hawk.data[index].Results) || hawk.data[index].Results.length === 0) {
            valid = false;
            html += ' No results in dataset.';
        } else {
            hawk.data[index].GraphType = parseInt(hawk.data[index].GraphType);
            switch (hawk.data[index].GraphType) {
                case 1:
                    html += ' Stacked Bar + Line Graph.';
                    if (hawk.data[index].GraphTitle == undefined || hawk.data[index].GraphTitle == null) {
                        valid = false;
                        html += ' No graph title set.';
                    }
                    if (hawk.data[index].GraphY1AxisLabel == undefined || hawk.data[index].GraphY1AxisLabel == null) {
                        valid = false;
                        html += ' No GraphY1AxisLabel set.';
                    }
                    if (hawk.data[index].GraphY2AxisLabel == undefined || hawk.data[index].GraphY2AxisLabel == null) {
                        valid = false;
                        html += ' No GraphY2AxisLabel set.';
                    }
                    if (hawk.data[index].GraphNumber == undefined || hawk.data[index].GraphNumber == null) {
                        valid = false;
                        html += ' No GraphNumber set.';
                    }
                    if (hawk.data[index].GraphNumberLabel == undefined || hawk.data[index].GraphNumberLabel == null) {
                        valid = false;
                        html += ' No GraphNumberLabel set.';
                    }
                    for (var a = 0; a < hawk.data[index].Results.length; a++) {
                        if (hawk.data[index].Results[a].SubResults == undefined || hawk.data[index].Results[a].SubResults == null || !Array.isArray(hawk.data[index].Results[a].SubResults) || hawk.data[index].Results[a].SubResults.length === 0) {
                            valid = false;
                            html += ' Missing subresults in dataset.';
                        } else {
                            for (var b = 0; b < hawk.data[index].Results[a].SubResults.length; b++) {
                                if (hawk.data[index].Results[a].SubResults[b].Timestamp == undefined || hawk.data[index].Results[a].SubResults[b].Timestamp == null) {
                                    valid = false;
                                    html += ' Missing Timestamp in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].Line1Value == undefined || hawk.data[index].Results[a].SubResults[b].Line1Value == null) {
                                    valid = false;
                                    html += ' Missing Line1Value in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].StackedBar1Value == undefined || hawk.data[index].Results[a].SubResults[b].StackedBar1Value == null) {
                                    valid = false;
                                    html += ' Missing StackedBar1Value in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].StackedBar2Value == undefined || hawk.data[index].Results[a].SubResults[b].StackedBar2Value == null) {
                                    valid = false;
                                    html += ' Missing StackedBar2Value in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].StackedBar3Value == undefined || hawk.data[index].Results[a].SubResults[b].StackedBar3Value == null) {
                                    valid = false;
                                    html += ' Missing StackedBar3Value in subresults ' + b + '.';
                                }
                            }
                        }
                    }
                    break;
                case 2:
                    html += ' Bar Graph.';
                    if (hawk.data[index].GraphTitle == undefined || hawk.data[index].GraphTitle == null) {
                        valid = false;
                        html += ' No graph title set.';
                    }
                    if (hawk.data[index].GraphY1AxisLabel == undefined || hawk.data[index].GraphY1AxisLabel == null) {
                        valid = false;
                        html += ' No GraphY1AxisLabel set.';
                    }
                    if (hawk.data[index].GraphNumber == undefined || hawk.data[index].GraphNumber == null) {
                        valid = false;
                        html += ' No GraphNumber set.';
                    }
                    for (var a = 0; a < hawk.data[index].Results.length; a++) {
                        if (hawk.data[index].Results[a].SubResults == undefined || hawk.data[index].Results[a].SubResults == null || !Array.isArray(hawk.data[index].Results[a].SubResults) || hawk.data[index].Results[a].SubResults.length === 0) {
                            valid = false;
                            html += ' Missing subresults in dataset.';
                        } else {
                            for (var b = 0; b < hawk.data[index].Results[a].SubResults.length; b++) {
                                if (hawk.data[index].Results[a].SubResults[b].Timestamp == undefined || hawk.data[index].Results[a].SubResults[b].Timestamp == null) {
                                    valid = false;
                                    html += ' Missing Timestamp in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].BarGraphValue == undefined || hawk.data[index].Results[a].SubResults[b].BarGraphValue == null) {
                                    valid = false;
                                    html += ' Missing BarGraphValue in subresults ' + b + '.';
                                }
                            }
                        }
                    }
                    break;
                case 3:
                    html += ' Line Graph.';
                    if (hawk.data[index].GraphTitle == undefined || hawk.data[index].GraphTitle == null) {
                        valid = false;
                        html += ' No graph title set.';
                    }
                    /*if (hawk.data[index].GraphY1AxisLabel == undefined || hawk.data[index].GraphY1AxisLabel == null) {
                        valid = false;
                        html += ' No GraphY1AxisLabel set.';
                    }
                    if (hawk.data[index].GraphNumber == undefined || hawk.data[index].GraphNumber == null) {
                        valid = false;
                        html += ' No GraphNumber set.';
                    }*/
                    for (var a = 0; a < hawk.data[index].Results.length; a++) {
                        if (hawk.data[index].Results[a].SubResults == undefined || hawk.data[index].Results[a].SubResults == null || !Array.isArray(hawk.data[index].Results[a].SubResults) || hawk.data[index].Results[a].SubResults.length === 0) {
                            valid = false;
                            html += ' Missing subresults in dataset.';
                        } else {
                            for (var b = 0; b < hawk.data[index].Results[a].SubResults.length; b++) {
                                if (hawk.data[index].Results[a].SubResults[b].Timestamp == undefined || hawk.data[index].Results[a].SubResults[b].Timestamp == null) {
                                    valid = false;
                                    html += ' Missing Timestamp in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].Line1Value == undefined || hawk.data[index].Results[a].SubResults[b].Line1Value == null) {
                                    valid = false;
                                    html += ' Missing Line1Value in subresults ' + b + '.';
                                }
                            }
                        }
                    }
                    break;
                case 4:
                    html += ' Pie Graph.';
                    if (hawk.data[index].GraphTitle == undefined || hawk.data[index].GraphTitle == null) {
                        valid = false;
                        html += ' No graph title set.';
                    }
                    for (var a = 0; a < hawk.data[index].Results.length; a++) {
                        if (hawk.data[index].Results[a].SubResults == undefined || hawk.data[index].Results[a].SubResults == null || !Array.isArray(hawk.data[index].Results[a].SubResults) || hawk.data[index].Results[a].SubResults.length === 0) {
                            valid = false;
                            html += ' Missing subresults in dataset.';
                        } else {
                            for (var b = 0; b < hawk.data[index].Results[a].SubResults.length; b++) {
                                if (hawk.data[index].Results[a].SubResults[b].Label == undefined || hawk.data[index].Results[a].SubResults[b].Label == null) {
                                    valid = false;
                                    html += ' Missing Label in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].Value == undefined || hawk.data[index].Results[a].SubResults[b].Value == null) {
                                    valid = false;
                                    html += ' Missing Value in subresults ' + b + '.';
                                }
                            }
                        }
                    }
                    break;
                case 5:
                    html += ' Funnel Graph.';
                    if (hawk.data[index].GraphTitle == undefined || hawk.data[index].GraphTitle == null) {
                        valid = false;
                        html += ' No graph title set.';
                    }
                    for (var a = 0; a < hawk.data[index].Results.length; a++) {
                        if (hawk.data[index].Results[a].SubResults == undefined || hawk.data[index].Results[a].SubResults == null || !Array.isArray(hawk.data[index].Results[a].SubResults) || hawk.data[index].Results[a].SubResults.length === 0) {
                            valid = false;
                            html += ' Missing subresults in dataset.';
                        } else {
                            for (var b = 0; b < hawk.data[index].Results[a].SubResults.length; b++) {
                                if (hawk.data[index].Results[a].SubResults[b].Label == undefined || hawk.data[index].Results[a].SubResults[b].Label == null) {
                                    valid = false;
                                    html += ' Missing Label in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].Value == undefined || hawk.data[index].Results[a].SubResults[b].Value == null) {
                                    valid = false;
                                    html += ' Missing Value in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].Percent == undefined || hawk.data[index].Results[a].SubResults[b].Percent == null) {
                                    valid = false;
                                    html += ' Missing Percent in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].SubPercent == undefined || hawk.data[index].Results[a].SubResults[b].SubPercent == null) {
                                    valid = false;
                                    html += ' Missing SubPercent in subresults ' + b + '.';
                                }
                            }
                        }
                    }
                    break;
                case 6:
                    html += ' Sales Data Table.';
                    if (hawk.data[index].GraphTitle == undefined || hawk.data[index].GraphTitle == null) {
                        valid = false;
                        html += ' No graph title set.';
                    }
                    for (var a = 0; a < hawk.data[index].Results.length; a++) {
                        if (hawk.data[index].Results[a].SubResults == undefined || hawk.data[index].Results[a].SubResults == null || !Array.isArray(hawk.data[index].Results[a].SubResults) || hawk.data[index].Results[a].SubResults.length === 0) {
                            valid = false;
                            html += ' Missing subresults in dataset.';
                        } else {
                            for (var b = 0; b < hawk.data[index].Results[a].SubResults.length; b++) {
                                if (hawk.data[index].Results[a].SubResults[b].Title == undefined || hawk.data[index].Results[a].SubResults[b].Title == null) {
                                    valid = false;
                                    html += ' Missing Title in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].Count == undefined || hawk.data[index].Results[a].SubResults[b].Count == null) {
                                    valid = false;
                                    html += ' Missing Count in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].TotalRevenue == undefined || hawk.data[index].Results[a].SubResults[b].TotalRevenue == null) {
                                    valid = false;
                                    html += ' Missing TotalRevenue in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].OrderPercentage == undefined || hawk.data[index].Results[a].SubResults[b].OrderPercentage == null) {
                                    valid = false;
                                    html += ' Missing OrderPercentage in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].MarginPercentage == undefined || hawk.data[index].Results[a].SubResults[b].MarginPercentage == null) {
                                    valid = false;
                                    html += ' Missing MarginPercentage in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].Currency == undefined || hawk.data[index].Results[a].SubResults[b].Currency == null) {
                                    valid = false;
                                    html += ' Missing Currency in subresults ' + b + '.';
                                }
                            }
                        }
                    }
                    break;
                case 7:
                    html += ' Bar + Line Graph.';
                    if (hawk.data[index].GraphTitle == undefined || hawk.data[index].GraphTitle == null) {
                        valid = false;
                        html += ' No graph title set.';
                    }
                    for (var a = 0; a < hawk.data[index].Results.length; a++) {
                        if (hawk.data[index].Results[a].SubResults == undefined || hawk.data[index].Results[a].SubResults == null || !Array.isArray(hawk.data[index].Results[a].SubResults) || hawk.data[index].Results[a].SubResults.length === 0) {
                            valid = false;
                            html += ' Missing subresults in dataset.';
                        } else {
                            for (var b = 0; b < hawk.data[index].Results[a].SubResults.length; b++) {
                                if (hawk.data[index].Results[a].SubResults[b].Timestamp == undefined || hawk.data[index].Results[a].SubResults[b].Timestamp == null) {
                                    valid = false;
                                    html += ' Missing Timestamp in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].Line1Value == undefined || hawk.data[index].Results[a].SubResults[b].Line1Value == null) {
                                    valid = false;
                                    html += ' Missing Line1Value in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].BarGraphValue == undefined || hawk.data[index].Results[a].SubResults[b].BarGraphValue == null) {
                                    valid = false;
                                    html += ' Missing BarGraphValue in subresults ' + b + '.';
                                }
                            }
                        }
                    }
                    break;
                case 9:
                    html += ' Heat Map.';
                    if (hawk.data[index].GraphTitle == undefined || hawk.data[index].GraphTitle == null) {
                        valid = false;
                        html += ' No graph title set.';
                    }
                    if (hawk.data[index].GraphHeaders == undefined || hawk.data[index].GraphHeaders == null || !Array.isArray(hawk.data[index].GraphHeaders) || hawk.data[index].GraphHeaders.length === 0) {
                        valid = false;
                        html += ' No GraphHeaders set.';
                    }
                    for (var a = 0; a < hawk.data[index].Results.length; a++) {
                        if (hawk.data[index].Results[a].SubResults == undefined || hawk.data[index].Results[a].SubResults == null || !Array.isArray(hawk.data[index].Results[a].SubResults) || hawk.data[index].Results[a].SubResults.length === 0) {
                            valid = false;
                            html += ' Missing subresults in dataset.';
                        } else {
                            for (var b = 0; b < hawk.data[index].Results[a].SubResults.length; b++) {
                                if (hawk.data[index].Results[a].SubResults[b].Label == undefined || hawk.data[index].Results[a].SubResults[b].Label == null) {
                                    valid = false;
                                    html += ' Missing Label in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].Value1 == undefined || hawk.data[index].Results[a].SubResults[b].Value1 == null) {
                                    valid = false;
                                    html += ' Missing Value1 in subresults ' + b + '.';
                                }
                            }
                        }
                    }
                    break;
                case 10:
                    html += ' Error Messages List.';
                    if (hawk.data[index].GraphTitle == undefined || hawk.data[index].GraphTitle == null) {
                        valid = false;
                        html += ' No graph title set.';
                    }
                    for (var a = 0; a < hawk.data[index].Results.length; a++) {
                        if (hawk.data[index].Results[a].SubResults == undefined || hawk.data[index].Results[a].SubResults == null || !Array.isArray(hawk.data[index].Results[a].SubResults) || hawk.data[index].Results[a].SubResults.length === 0) {
                            valid = false;
                            html += ' Missing subresults in dataset.';
                        } else {
                            for (var b = 0; b < hawk.data[index].Results[a].SubResults.length; b++) {
                                if (hawk.data[index].Results[a].SubResults[b].TotalErrors == undefined || hawk.data[index].Results[a].SubResults[b].TotalErrors == null) {
                                    valid = false;
                                    html += ' Missing TotalErrors in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].VisitorsImpacted == undefined || hawk.data[index].Results[a].SubResults[b].VisitorsImpacted == null) {
                                    valid = false;
                                    html += ' Missing VisitorsImpacted in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].Message == undefined || hawk.data[index].Results[a].SubResults[b].Message == null) {
                                    valid = false;
                                    html += ' Missing Message in subresults ' + b + '.';
                                }
                            }
                        }
                    }
                    break;
                case 11:
                    html += ' Speed Data Table.';
                    for (var a = 0; a < hawk.data[index].Results.length; a++) {
                        if (hawk.data[index].Results[a].SubResults == undefined || hawk.data[index].Results[a].SubResults == null || !Array.isArray(hawk.data[index].Results[a].SubResults) || hawk.data[index].Results[a].SubResults.length === 0) {
                            valid = false;
                            html += ' Missing subresults in dataset.';
                        } else {
                            for (var b = 0; b < hawk.data[index].Results[a].SubResults.length; b++) {
                                if (hawk.data[index].Results[a].SubResults[b].Label == undefined || hawk.data[index].Results[a].SubResults[b].Label == null) {
                                    valid = false;
                                    html += ' Missing label in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].NormalPercent == undefined || hawk.data[index].Results[a].SubResults[b].NormalPercent == null) {
                                    valid = false;
                                    html += ' Missing normal percent in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].NormalValue == undefined || hawk.data[index].Results[a].SubResults[b].NormalValue == null) {
                                    valid = false;
                                    html += ' Missing NormalValue in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].SlowPercent == undefined || hawk.data[index].Results[a].SubResults[b].SlowPercent == null) {
                                    valid = false;
                                    html += ' Missing SlowPercent in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].SlowValue == undefined || hawk.data[index].Results[a].SubResults[b].SlowValue == null) {
                                    valid = false;
                                    html += ' Missing SlowValue in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].VerySlowPercent == undefined || hawk.data[index].Results[a].SubResults[b].VerySlowPercent == null) {
                                    valid = false;
                                    html += ' Missing VerySlowPercent in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].VerySlowValue == undefined || hawk.data[index].Results[a].SubResults[b].VerySlowValue == null) {
                                    valid = false;
                                    html += ' Missing VerySlowValue in subresults ' + b + '.';
                                }
                            }
                        }
                    }
                    break;
                case 12:
                    html += ' Standard Data Table.';
                    if (hawk.data[index].GraphTitle == undefined || hawk.data[index].GraphTitle == null) {
                        valid = false;
                        html += ' No graph title set.';
                    }
                    if (hawk.data[index].GraphHeaders == undefined || hawk.data[index].GraphHeaders == null || !Array.isArray(hawk.data[index].GraphHeaders) || hawk.data[index].GraphHeaders.length === 0) {
                        valid = false;
                        html += ' No GraphHeaders set.';
                    }
                    for (var a = 0; a < hawk.data[index].Results.length; a++) {
                        if (hawk.data[index].Results[a].SubResults == undefined || hawk.data[index].Results[a].SubResults == null || !Array.isArray(hawk.data[index].Results[a].SubResults) || hawk.data[index].Results[a].SubResults.length === 0) {
                            valid = false;
                            html += ' Missing subresults in dataset.';
                        } else {
                            for (var b = 0; b < hawk.data[index].Results[a].SubResults.length; b++) {
                                if (hawk.data[index].Results[a].SubResults[b].Value1 == undefined || hawk.data[index].Results[a].SubResults[b].Value1 == null) {
                                    valid = false;
                                    html += ' Missing Value in subresults ' + b + '.';
                                }
                            }
                        }
                    }
                    break;
                case 13:
                    html += ' Multi Color Line Graph.';
                    if (hawk.data[index].GraphTitle == undefined || hawk.data[index].GraphTitle == null) {
                        valid = false;
                        html += ' No graph title set.';
                    }
                    for (var a = 0; a < hawk.data[index].Results.length; a++) {
                        if (hawk.data[index].Results[a].SubResults == undefined || hawk.data[index].Results[a].SubResults == null || !Array.isArray(hawk.data[index].Results[a].SubResults) || hawk.data[index].Results[a].SubResults.length === 0) {
                            valid = false;
                            html += ' Missing subresults in dataset.';
                        } else {
                            for (var b = 0; b < hawk.data[index].Results[a].SubResults.length; b++) {
                                if (hawk.data[index].Results[a].SubResults[b].Timestamp == undefined || hawk.data[index].Results[a].SubResults[b].Timestamp == null) {
                                    valid = false;
                                    html += ' Missing Timestamp in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].Line1Value == undefined || hawk.data[index].Results[a].SubResults[b].Line1Value == null) {
                                    valid = false;
                                    html += ' Missing Line1Value in subresults ' + b + '.';
                                }
                            }
                        }
                    }
                    break;
                case 14:
                    html += ' Multi Color Line Graph.';
                    if (hawk.data[index].GraphTitle == undefined || hawk.data[index].GraphTitle == null) {
                        valid = false;
                        html += ' No graph title set.';
                    }
                    if (hawk.data[index].GraphNumber == undefined || hawk.data[index].GraphNumber == null) {
                        valid = false;
                        html += ' No GraphNumber set.';
                    }
                    for (var a = 0; a < hawk.data[index].Results.length; a++) {
                        if (hawk.data[index].Results[a].SubResults == undefined || hawk.data[index].Results[a].SubResults == null || !Array.isArray(hawk.data[index].Results[a].SubResults) || hawk.data[index].Results[a].SubResults.length === 0) {
                            valid = false;
                            html += ' Missing subresults in dataset.';
                        } else {
                            for (var b = 0; b < hawk.data[index].Results[a].SubResults.length; b++) {
                                if (hawk.data[index].Results[a].SubResults[b].Timestamp == undefined || hawk.data[index].Results[a].SubResults[b].Timestamp == null) {
                                    valid = false;
                                    html += ' Missing Timestamp in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].Line1Value == undefined || hawk.data[index].Results[a].SubResults[b].Line1Value == null) {
                                    valid = false;
                                    html += ' Missing Line1Value in subresults ' + b + '.';
                                }
                            }
                        }
                    }
                    break;
                case 15:
                    html += ' Comment Messages.';
                    if (hawk.data[index].GraphTitle == undefined || hawk.data[index].GraphTitle == null) {
                        valid = false;
                        html += ' No graph title set.';
                    }
                    for (var a = 0; a < hawk.data[index].Results.length; a++) {
                        if (hawk.data[index].Results[a].SubResults == undefined || hawk.data[index].Results[a].SubResults == null || !Array.isArray(hawk.data[index].Results[a].SubResults) || hawk.data[index].Results[a].SubResults.length === 0) {
                            valid = false;
                            html += ' Missing subresults in dataset.';
                        } else {
                            for (var b = 0; b < hawk.data[index].Results[a].SubResults.length; b++) {
                                if (hawk.data[index].Results[a].SubResults[b].Rating == undefined || hawk.data[index].Results[a].SubResults[b].Rating == null) {
                                    valid = false;
                                    html += ' Missing Rating in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].Segment == undefined || hawk.data[index].Results[a].SubResults[b].Segment == null) {
                                    valid = false;
                                    html += ' Missing Segment in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].Message == undefined || hawk.data[index].Results[a].SubResults[b].Message == null) {
                                    valid = false;
                                    html += ' Missing Message in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].Time == undefined || hawk.data[index].Results[a].SubResults[b].Time == null) {
                                    valid = false;
                                    html += ' Missing Time in subresults ' + b + '.';
                                }
                                if (hawk.data[index].Results[a].SubResults[b].Country == undefined || hawk.data[index].Results[a].SubResults[b].Country == null) {
                                    valid = false;
                                    html += ' Missing Country in subresults ' + b + '.';
                                }
                            }
                        }
                    }
                    break;
                default:
                    valid = false;
                    html += ' Invalid Graph Type.';
                    break;
            }
        }
        if (!valid) {
            if (hawk.hawkDebug) {
                $('.graph' + index).html(html);
            } else {
                $('.graph' + index).html(html2);
            }
        }
        return valid;
    };
    /*
     * Create graph placeholder container on page.
     * @param Int index
     */
    hawk.createGraphContainer = function (index) {
        var html = '<div class="graph-container graph' + index + '"></div>';
        $('.graphs').append(html);
    };
    /*
     * Create global configuration attributes.
     * @param Int index
     */
    hawk.globalConfig = function () {
        hawk.existingGraphTypes = [];
        hawk.graphMargins = {
            top: 10,
            left: 45,
            right: 45,
            bottom: 30
        };
        // static thresholds message. 1=calc time (default). 2=today (sales).
        hawk.thresholdsMsg = 1;
        hawk.thresholdsMsgHtml1 = 'Static thresholds for last 30 minutes, last updated <span class="last-updated-minutes">0 minutes</span> ago.';
        hawk.thresholdsMsgHtml2 = 'Static thresholds for today CST.';
        // Dates
        hawk.now = new Date();
        hawk.lastDate = -1;
        hawk.minutesSinceLastUpdate = null;
        // Desktop: used for resizing and scroll bar.
        hawk.desktop = false;
        if (hawk.incomingData.desktop != undefined && hawk.incomingData.desktop != null) {
            hawk.desktop = hawk.incomingData.desktop;
        }
        // Config and maintain state for filters
        hawk.filters = [
            {
                label: 'Country',
                active: 'us',
                inputShowing: false,
                filterValues: []
            },
            {
                label: 'Segment',
                active: 1,
                inputShowing: false,
                filterValues: [
                    { value: 1, label: 'For Home' },
                    { value: 2, label: 'For Work' }
                ]
            },
            {
                label: 'Region',
                active: null,
                inputShowing: false,
                filterValues: []
            },
            {
                label: 'Identity',
                active: null,
                inputShowing: false,
                filterValues: []
            }
        ];
        // Dell color set to use on graphs
        hawk.colors = ['#6E2585', '#EE6411', '#B7295A', '#0076CE', '#6EA204', '#F2AF00', '#41B6E6', '#CE1126', '#00447C', '#444444'];
        hawk.funnelColors = ['#EE6411', '#B7295A', '#6E2585', '#0076CE', '#6EA204', '#F2AF00']
        hawk.statusColors = ["#CE1126", "#F2AF00", "#6EA204"];
        // Device screen width
        hawk.screenWidth = Response.viewportW();
        // Calculate dimensions
        // 22px = margin/padding/border of chart container
        hawk.svgWidth = (hawk.screenWidth - 12);
        if (hawk.desktop) {
            // 16px = browser window scroll bar width
            hawk.svgWidth -= 16;
        }
        hawk.svgHeight = (hawk.svgWidth * 0.6);
        return;
    };
    /*
     * Basic high level dataset validation to catch big errors.
     */
    hawk.validateDataset = function () {
        var valid = true,
            html = 'Error: Invalid Dataset, cannot create any graphs.';
        if (hawk.incomingData == null || hawk.incomingData.data == undefined || hawk.incomingData.data == null || !Array.isArray(hawk.incomingData.data) || hawk.incomingData.data.length === 0) {
            valid = false;
        }
        if (valid) {
            hawk.data = hawk.incomingData.data;
        } else {
            $('.graphs').html(html);
        }
        return valid;
    };
    /*
     * Initialize script
     */
    hawk.init = function () {
        if (hawk.validateDataset()) {
            $('.graphs-container').html('').append('<div class="filters"></div><div class="graphs"></div><div class="updated-label"></div>');
            hawk.globalConfig();
            hawk.createFilters();
            for (var index = 0; index < hawk.data.length; index++) {
                //create placeholder for each graph or error
                hawk.createGraphContainer(index);
                //if graph data is valid, add graph to page
                if (hawk.validateGraphData(index)) {
                    hawk.createGraph(index);
                    hawk.setLastUpdatedDate(index);
                }
            }
            // Recalculate dimensions and redraw graphs on window resize
            Response.resize(function () {
                if (hawk.hawkDebug) { console.log('hawk.init @RESIZE'); }
                hawk.screenWidth = Response.viewportW();
                hawk.svgWidth = (hawk.screenWidth - 12);
                if (hawk.desktop) {
                    hawk.svgWidth -= 16;
                }
                hawk.svgHeight = (hawk.svgWidth * 0.6);
                for (var index = 0; index < hawk.data.length; index++) {
                    if (hawk.validateGraphData(index)) {
                        hawk.createGraph(index);
                        hawk.setLastUpdatedDate(index);
                    }
                }
            });
            // Add last updated label to bottom of page
            $('.updated-label').html(hawk['thresholdsMsgHtml' + hawk.thresholdsMsg]);
            // if thresholds msg 1 exists, then fill in calculated time
            $('.last-updated-minutes').html(hawk.getMinutesSinceLastUpdate());
            if (hawk.hawkDebug) {
                console.log('hawk.init @dataset=');
                console.log(hawk.data);
            }
        }
    };
    // Start script
    hawk.init();
};
