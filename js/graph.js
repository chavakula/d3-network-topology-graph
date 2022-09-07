var svg = d3.select("svg"),
            width = +svg.attr("width"),
            height = +svg.attr("height");
        
var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { console.log(d); return d.id; }).distance(100))
    .force("charge", d3.forceManyBody().strength(-1000))
    .force("center", d3.forceCenter(width / 2, height / 2));

    d3.json("data.json").then(function(graph) {
        graph.links.forEach(function(d){
        d.source = d.source_id;    
        d.target = d.target_id;
        });           
        
    var link = svg.selectAll("line")
                .data(graph.links)
                .enter().append("g");

        link.each(function (d, i) {
            var _this = d3.select(this);
            _this.append("text")
                        .text(d.title)
                        .attr("class", "linktitle");
        });

        link.each(function (d, i) {
            var _this = d3.select(this);
            _this.append("line")
                        .attr("class", "link")
                        .style("stroke", "#aaa")
                        .style("stroke-width", 2);
        });
        
    var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .html("");

    var node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "nodes")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

        node.on("mouseover", function(event, d){              
                t_text = "<strong>" + d.description + "</strong>"
                tooltip.html(t_text)
                return tooltip.style("visibility", "visible");
                })
                .on("mousemove", function(event){ return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
                .on("mouseout", function(event){return tooltip.style("visibility", "hidden")});

        node.append("image")
                    .attr("xlink:href", function (d) {
                            return d.image;
                        })
                    .attr("x", -20)
                    .attr("y", -20)
                    .attr("width", 40)
                    .attr("height", 40);
          
        var label = svg.append("g")
              .attr("class", "titleLabel")
              .selectAll("text")
              .data(graph.nodes)
              .enter().append("text")
              .attr("class", "label")
              .text(function(d) { return d.name; });
        
          simulation
              .nodes(graph.nodes)
              .on("tick", ticked);
        
          simulation.force("link")
              .links(graph.links);
        
          function ticked() {        
            link.select("line").attr("x1", function (d) {
                                return d.source.x;
                            })
                            .attr("y1", function (d) {
                                return d.source.y;
                            })
                            .attr("x2", function (d) {
                                return d.target.x;
                            })
                            .attr("y2", function (d) {
                                return d.target.y;
                            });
        
                link.select("text")
                    .attr('x', function (d) {
                        var x1 = d.source.x,
                            x2 = d.target.x,
                            halfX = x1 - (x1 - x2) / 2,
                            x3 = x1 - (x1 - halfX) / 2;
                        return x3 + 15;                            
                    })
                    .attr('y', function (d) {
                        var y1 = d.source.y,
                            y2 = d.target.y,
                            halfY = y1 - (y1 - y2) / 2,
                            y3 = y1 - (y1 - halfY) / 2;

                        // Make a gap between the text and the line segment
                        y3 = y3 - 5;
                        return y3;
                    })
                    .attr("transform", function (d) {
                        var x1 = d.source.x,
                            x2 = d.target.x,
                            y1 = d.source.y,
                            y2 = d.target.y,
                            x = x1 - (x1 - x2) / 2,
                            y = y1 - (y1 - y2) / 2,
                            rightAngleSide1 = Math.abs(y2 - y1),
                            rightAngleSide2 = Math.abs(x2 - x1),
                            _asin = 0,
                            _rotateAngle = 0,
                            x3 = x1 - (x1 - x) / 2,
                            y3 = y1 - (y1 - y) / 2;

                        if (x1 < x2) {
                            _asin = (y2 - y1) / Math.sqrt(Math.pow(rightAngleSide1, 2) + Math.pow(
                                rightAngleSide2, 2));
                            _rotateAngle = Math.asin(_asin) * 180 / Math.PI;
                        } else {
                            _asin = (y1 - y2) / Math.sqrt(Math.pow(rightAngleSide1, 2) + Math.pow(
                                rightAngleSide2, 2));
                            _rotateAngle = Math.asin(_asin) * 180 / Math.PI;
                            _rotateAngle = _rotateAngle < 0 ? (180 + _rotateAngle) : -(180 -
                                _rotateAngle);
                        }


                        return 'rotate(' + (_rotateAngle) + ',' + x3 + ' ' + y3 + ')'; // Take one-third of the line segment as the focus of rotation                            
                    });
        
            node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
            
            node
            .select("text").attr('dy', function (d) {
                var image = this.previousSibling,
                    height = parseFloat(60),
                    fontSize = parseFloat(this.style.fontSize);

                return height + 1.5 * fontSize;
            });
            
            label
                .attr("x", function(d) { return d.x - 18; })
                .attr("y", function (d) { return d.y + 35; })
                .style("font-size", "12px").style("fill", "#4393c3");
          }
        });
        
        function dragstarted(event, d) {
         if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fy = d.y; //fx - the node’s fixed x-position. Original is null.
            d.fx = d.x; //fy - the node’s fixed y-position. Original is null.
        }
        
        function dragged(event, d) {
           d.fx = event.x;
           d.fy = event.y;
        }
        
        function dragended(event, d) {
           if (!event.active) simulation.alphaTarget(0);
           d.fx = null;
           d.fy = null;          
        }
