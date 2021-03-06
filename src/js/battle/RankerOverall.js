// JavaScript Document

/*
* This object loads all current ranking data from each category and produces overall rating
*/

var RankerMaster = (function () {
    var instance;
 
    function createInstance() {
		
		
        var object = new rankerObject();
		
		function rankerObject(){
			var gm = GameMaster.getInstance();
			var battle = BattleMaster.getInstance();
			
			var rankings = [];
			
			var self = this;
			
			// Hook for interface
			
			this.rankLoop = function(){
				this.rank();
			}
			
			// Load existing ranking data
			
			this.rank = function(){
				
				var cup = battle.getCup().name;
				var league = String(battle.getCP());
				var categories = ["leads","closers","attackers","defenders"];
				
				for(var i = 0; i < categories.length; i++){
					gm.loadRankingData(self, categories[i], league, cup);
				}
			}
			
			// If all data is loaded, process it
			
			this.displayRankingData = function(){
				
				var league = battle.getCP().toString();
				var cup = battle.getCup().name;
				var categories = ["leads","closers","attackers","defenders"];

				if(gm.loadedData < categories.length){
					return;
				}
				
				gm.loadedData = 0;
				
				rankings = [];
				
				for(var i = 0; i < categories.length; i++){
					
					var key = cup + "" + categories[i] + "" + league;
					
					var arr = gm.rankings[key];

					// Sort by species name
					
					arr.sort((a,b) => (a.speciesName > b.speciesName) ? 1 : ((b.speciesName > a.speciesName) ? -1 : 0));
					
					for(var n = 0; n < arr.length; n++){
						var rankObj = arr[n];
						
						if(! rankings[n]){
							
							rankObj.scores = [rankObj.score];
							rankObj.score = rankObj.score;
							
							// Sort moves by id
							
							rankObj.moves.fastMoves.sort((a,b) => (a.moveId > b.moveId) ? -1 : ((b.moveId > a.moveId) ? 1 : 0));
							rankObj.moves.chargedMoves.sort((a,b) => (a.moveId > b.moveId) ? -1 : ((b.moveId > a.moveId) ? 1 : 0));
							
							rankings.push(rankObj);

						} else{
							rankings[n].score *= rankObj.score;
							rankings[n].scores.push(rankObj.score);
							
							// Add move usage for all moves
							
							rankObj.moves.fastMoves.sort((a,b) => (a.moveId > b.moveId) ? -1 : ((b.moveId > a.moveId) ? 1 : 0));
							rankObj.moves.chargedMoves.sort((a,b) => (a.moveId > b.moveId) ? -1 : ((b.moveId > a.moveId) ? 1 : 0));
							
							for(var j = 0; j < rankObj.moves.fastMoves.length; j++){
								rankings[n].moves.fastMoves[j].uses += rankObj.moves.fastMoves[j].uses;
							}
							
							for(var j = 0; j < rankObj.moves.chargedMoves.length; j++){
								rankings[n].moves.chargedMoves[j].uses += rankObj.moves.chargedMoves[j].uses;
							}
						}
					}
				}
				
				// Produce final rankings
				
				for(var i = 0; i < rankings.length; i++){
					// This is a geometric mean Root(A * B* C) because the existing scores are percentages
					rankings[i].score = Math.floor(Math.pow(rankings[i].score, 1 / categories.length)*10) / 10;
				}
				
				rankings.sort((a,b) => (a.score > b.score) ? -1 : ((b.score > a.score) ? 1 : 0));
				
				var json = JSON.stringify(rankings);
				
				console.log(json);
				
				var json = JSON.stringify(rankings);
				var league = battle.getCP();
				var category = "overall";

				console.log(category+"/rankings-"+league+".json");
				
				// Write to a file
				
				$.ajax({

					url : 'data/write.php',
					type : 'POST',
					data : {
						'data' : json,
						'league' : league,
						'category' : category,
						'cup' : cup
					},
					dataType:'json',
					success : function(data) {              
						console.log(data);
					},
					error : function(request,error)
					{
						console.log("Request: "+JSON.stringify(request));
					}
				});
				
				return rankings;
			}

		};
		
        return object;
	}
 
    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();