//Author: Kenny Gong
//Date: Aug 22, 2022

//Shoutout Allison Gong for helping me out! Appreciate u :)

//Coordinated Effects Index


//Get access to the button and set up a click event handler 
var button = document.getElementById("submit");

//Let's begin by defining our global variables, our basic inputs and outputs
//share1 through share 10 are our market share inputs (type: list of float)
var shareElems = getElemsById('ms', 1, 11)

//cf1 through cf10 are our coordinating firm inputs (type: list of checkbox)
var coordElems = getElemsById('cb', 1, 11);

//cf11 through cf 20 are our merging firm inputs (type: checkbox)
var mergingElems = getElemsById('cb', 11, 21);

//output1 through output10 are our alpha value outputs (type: float)
var alphaElems = getElemsByTag(2, 12);

//output11 through output 20 are our critical share outputs (type: float)
var critElems = getElemsByTag(12, 22);

var postCritElems = getElemsByTag(30, 40)

//These last outputs are our pre- and post-merger CEI and HHI (type: float)
var CEIHHIErrElems = getElemsByTag(22, 27);

var PIPElems = getElemsByTag(27, 28);
var OCEPIPElems = getElemsByTag(40, 41);
var IPRElems = getElemsByTag(41, 42);
var OCEIPRElems = getElemsByTag(42, 43);

var CEPIPElems = getElemsByTag(40, 41);

//Once submit button is pressed, it calls function main
button.addEventListener('click', function() {
    main();
});


/* 
JavaScript EmbedCode usage:

var wcc = new WolframCloudCall();
wcc.call(x, function(result) { console.log(result); });
*/
 
var WolframCloudCall;

(function() {
WolframCloudCall = function() {	this.init(); };

var p = WolframCloudCall.prototype;

p.init = function() {};

p._createCORSRequest = function(method, url) {
	var xhr = new XMLHttpRequest();
	if ("withCredentials" in xhr) {
		xhr.open(method, url, true);
	} else if (typeof XDomainRequest != "undefined") {
		xhr = new XDomainRequest();
		xhr.open(method, url);
	} else {
		xhr = null;
	}
	return xhr;
};

p._encodeArgs = function(args) {
	var argName;
	var params = "";
	for (argName in args) {
		params += (params == "" ? "" : "&");
		params += encodeURIComponent(argName) + "=" + encodeURIComponent(args[argName]);
	}
	return params;
};

p._auxCall = function(url, args, callback) {
	var params = this._encodeArgs(args);
	var xhr = this._createCORSRequest("post", url);
	if (xhr) {
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.setRequestHeader("EmbedCode-User-Agent", "EmbedCode-JavaScript/1.0");
		xhr.onload = function() {
			if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
				callback(xhr.responseText);
			} else {
				callback(null);
			}
		};
		xhr.send(params);
	} else {
		throw new Error("Could not create request object.");
	}
};

p.call = function(x, callback) {
	var url = "http://www.wolframcloud.com/obj/6cb9674a-3203-40af-9a5d-1efd7e36a642";
	var args = {x: x};
	var callbackWrapper = function(result) {
		if (result === null) callback(null);
		else callback(result);
	};
	this._auxCall(url, args, callbackWrapper);
};
})();

//Expermenting with wolfram
var wcc = new WolframCloudCall();
wcc.call(4, function(result) { console.log(result); });


//Global variable functions

//Get HTML element (location) for all inputs (shares, coordinating, and merging)
function getElemsById(nameStem, startIndex, stopIndex) {
    elems = []
    for (let i = startIndex; i < stopIndex; i++) {
        elem = document.getElementById(nameStem + String(i))
        elems.push(elem)
    }
    return elems
}

//Get HTML element (location) for all outputs(alphas, critical shares, pre- and post-merger CEI and HHI)
function getElemsByTag(startIndex, stopIndex) {
    elems = []
    for (let i = startIndex; i < stopIndex; i++) {
        elem = document.getElementsByTagName('p' + String(i))[0]
        elems.push(elem)
    }   
    return elems
}


//Main

//main function which calls all functions upon clicking submit
function main() {

    //Test functions for math.js and integration
    //sqRoot = squaretRoot(25);

    //Main!
    resetOutputs()
    console.log("Kenny")
    shares = getShares()
    margin = getMargin()
    if (shareSumChecker(shares) == true) {
        CEIHHIErrElems[4].innerHTML = "Sum of market shares must equal 100!"
        NAInserter()
        return 
    }
    if (negShareChecker(shares) == true) {
        CEIHHIErrElems[4].innerHTML = "Cannot have negative market shares!"
        NAInserter()
        return
    }
    alphaLists = alphaValues(shares, margin);
    alphas = alphaLists[0]
    alphasWithNA = alphaLists[1]
    console.log(alphas)
    criticalSharesList = criticalShares(shares, alphas)
    console.log("criticalSharesList: " + criticalSharesList)
    getCEIHHI(criticalSharesList, shares)
    getPostCEIHHI(alphas, criticalSharesList)
    getPIPIPR(alphas);

    //Edge case functions
    marginChecker(margin)
    alphaDisp()
    coordDisp()
    inpTypeChecker()
}

//Test function for math.js square root
/*function squareRoot(toBeRooted) {
    console.log(sqrt(toBeRooted).toString())
    return sqrt(toBeRooted)
}*/

//Reset all outputs to 0.0 before beginning again
function resetOutputs() {
    for (let i = 0; i < alphaElems.length; i++) {
        alphaElems[i].innerHTML = "0.0"
    }
    for (let i = 0; i < critElems.length; i++) {
        critElems[i].innerHTML = "0.0"
    }
    for (let i = 0; i < postCritElems.length; i++) {
        postCritElems[i].innerHTML = "0.0"
    }
    for (let i = 0; i < CEIHHIErrElems.length; i++) {
        CEIHHIErrElems[i].innerHTML = "0.0"
    }
}

//Get market share inputs
function getShares() {
    shares = []
    for (let i = 0; i < shareElems.length; i++){
        shares.push(parseFloat(shareElems[i].value))
    }
    return shares
}

//Get margin for firm 1
function getMargin() {
    let margin = parseFloat(document.getElementById("m").value) 
    console.log("margin :" + margin)
    return margin
}

//Check conditions of market shares (sum must be 100, and no market share can be negative)

//Check that market share sums to 100
function shareSumChecker(shares) {
    let sum = 0
    for (let i = 0; i < shares.length; i++){
        sum += shares[i]
    }
    console.log(parseFloat(sum))
    if (parseFloat(Math.round(10*sum)/10) != 100) {
        return true
    }
    return false
}

//Check that no market shares are less than 0
function negShareChecker(shares) {
    let negShareChecker = 0
    for (let i = 0; i < shares.length; i++){
        if (parseFloat(shares[i]) < 0.0) {
            negShareChecker += 1
        }
    }
    if (negShareChecker > 0) {
        return true
    }
    return false
}

//Alpha

//Caculate alpha values
function alphaValues(shares, margin) {
    numVar = getNumberFirms(shares);
    alphaListsVar = createAlphaValues(shares, numVar, margin)
    insertAlphaValues(alphaListsVar[1])
    return alphaListsVar
}

//Get number of firms (all firms with market share not equal to 0)
function getNumberFirms(shares) {
    var num = 0
    for (var i = 0; i < shares.length; i++) {
        if (parseFloat(shares[i]) != 0.0) {
        num += 1
        }
    }
    return num
}

//Get alpha values and scale down by 100, replace 0's with N/A
//TODO: use profit margins to calculate alpha values
function createAlphaValues(shares, num) {
    var alphas = []
    let share1 = parseFloat(shares[0])
    for (var i = 0; i < shares.length; i++) {
        console.log("shares[i]: " + shares[i])
        console.log("share1: " + share1)
        console.log("(shares[i] / 100.0): " + (shares[i] / 100.0))
        console.log("(1.0 / (margin / 100.0)) - 2.0 + (share1 / 100.0): " + (1.0 / (margin / 100.0)) - 2.0 + (share1 / 100.0))
        alphas[i] = Math.round((parseFloat((shares[i] / 100.0) / ((1.0 / (margin / 100.0)) - 2.0 + (share1 / 100.0)))) * 1000) / 1000
        console.log("alphas[i]: " + alphas[i])
    }
    alphasWithNA = []
    for (var i = 0; i < alphas.length; i++) {
        if (parseFloat(alphas[i]) == 0.0) {
            alphasWithNA[i] = "N/A"
        }
        if (parseFloat(alphas[i]) != 0.0) {
            alphasWithNA[i] = alphas[i]
        }
    }
    
    console.log(alphasWithNA)
    return [alphas, alphasWithNA]
}

//Insert alpha values into corresponding HTML location
function insertAlphaValues(alphaWithNA) {
    for (var i = 0; i < alphaElems.length; i++) {
        alphaElems[i].innerHTML = alphaWithNA[i]
    }
}

//Critical Shares

//Calculate critical shares
function criticalShares(shares, alphas) {
    sumAlphasVar = sumAlphas(alphas)
    listNoAlphaiVar = listNoAlphai(alphas)
    listSumNoAlphaiVar = sumNoAlphai(listNoAlphaiVar)
    listNoCheckVar = listNoCheck(alphas)
    sumNoCheckVar = sumNoCheck(listNoCheckVar)
    criticalValueList = getCriticalValues(alphas, sumAlphasVar, sumNoCheckVar, listSumNoAlphaiVar)
    insertCriticalValues(criticalValueList) 
    return criticalValueList   
}


//Get sum of inputted market shares
function sumAlphas(alphas) {
    let sumAlphas = 0
    for (let i = 0; i < alphas.length; i++) {
        sumAlphas += alphas[i];
    } 
    console.log(sumAlphas)
    return sumAlphas
} 

//Get a list of lists
//ith inner list has all alpha values except that of the i+1th firm  
function listNoAlphai(alphas) {
    let listNoAlphai = []
    for (let i = 0; i < alphas.length; i++) {
        alphasClone = arrayCloner(alphas)
        alphasClone.splice(i, 1)
        listNoAlphai.push(alphasClone)
    }
    console.log(listNoAlphai)
    return listNoAlphai
    
}

//Clone list of alphas to avoid shallow copying issue
function arrayCloner(arr) {
    let arrClone = []
    for (let i = 0; i < arr.length; i++) {
        arrClone.push(arr[i])
    }
    return arrClone
}

//Calculate sums of the inner lists missing alpha value of i+1th firm, in a list
function sumNoAlphai(listNoAlphai) {
    let listSumNoAlphai = []
    for (let i = 0; i < listNoAlphai.length; i++) {
        sum = 0
        for (let j = 0; j < listNoAlphai[i].length; j++) {
            sum += listNoAlphai[i][j]
        }
        listSumNoAlphai.push(sum)
    }
    console.log('listSumNoAlphai:' + listSumNoAlphai)
    return listSumNoAlphai
}

//Create list of alpha values of non-coordinating firms
function listNoCheck(alphas) {
    let listNoCheck = []
    for (let i = 0; i < alphas.length; i++) {
        if (coordElems[i].checked) {
            console.log('checked')
        }
        else {
            listNoCheck.push(alphas[i])
        }
    }
    console.log(listNoCheck)
    return listNoCheck
}

//Get the sum of the non-coordinating firms
function sumNoCheck(listNoCheck) {
    let sumNoCheck = 0
    for (let i = 0; i < listNoCheck.length; i++) {
        sumNoCheck += listNoCheck[i]
    }
    console.log('sumNoCheck: ' + sumNoCheck)
    return sumNoCheck
}

//Get list of critical values, with ith index corresonding to i+1th firm's critical value
function getCriticalValues(alphas, sumAlphasVar, sumNoCheckVar, listSumNoAlphaiVar) {
    let criticalValueList = []
    console.log('alphas: ' + alphas)
    console.log('sumAlphasVar: ' + sumAlphasVar)
    console.log('sumNoCheckVar: ' + sumNoCheckVar)
    console.log('listSumNoAlphaiVar: ' + listSumNoAlphaiVar)
    for (let i = 0; i < listSumNoAlphaiVar.length; i++) {
        critShare = ((1.0 + parseFloat(alphas[i]) + parseFloat(sumNoCheckVar)) * (1.0 + parseFloat(sumNoCheckVar))) / ((1.0 + parseFloat(listSumNoAlphaiVar[i])) * (1.0 + parseFloat(sumAlphasVar)))
        criticalValueList.push(Math.round(critShare * 1000) / 1000)
    }
    console.log(criticalValueList)
    return criticalValueList
}

////Insert alpha values into corresponding HTML location
function insertCriticalValues(criticalValueList) {
    for (let i = 0; i < criticalValueList.length; i++) {
        critElems[i].innerHTML = criticalValueList[i]
    }
}

//Pre- and post-merger CEI and HHI

function getCEIHHI(criticalSharesList, shares) {
    console.log("criticalSharesList: " + criticalSharesList)
    preCEIHHIList = getPreCEIHHI(criticalSharesList, shares)
    insertPreCEIHHI(preCEIHHIList)
}

function getPostCEIHHI(alphas, criticalSharesList) {
    preCritVar = getCriticalValues(alphas, sumAlphasVar, sumNoCheckVar, listSumNoAlphaiVar)
    mKCheckerBool = mKChecker()
    merAndUnmerList = mergedAlphasInit(alphas)
    sumMergedAlphasVar = sumMergedAlphas(merAndUnmerList[0])
    postAlphas = listMerAndUnmerAlphas(merAndUnmerList[1], sumMergedAlphasVar)
    listNoCheckMergeVar = listNoCheckMerge(postAlphas, mKCheckerBool)
    coordCheckerMergeVar = coordCheckerMerge(alphas)
    listNC1Var = listNC1(coordCheckerMergeVar, listNoCheckMergeVar)
    sumPostAlphasVar = sumPostAlphas(postAlphas)
    sumNCMergeFinalVar = sumNCMergeFinal(listNC1Var)
    listNoCheckMergeCloneVar = listNoCheckMergeClone(listNC1Var)
    listCheckedPostMergeVar = listCheckedPostMerge(listNoCheckMergeCloneVar, postAlphas)
    listSPostVar =listSPost(listCheckedPostMergeVar, sumNCMergeFinalVar, sumPostAlphasVar, postAlphas)
    insertSPost(listSPostVar, criticalSharesList)
    numPostSCheck();
    sumSPostVar = sumSPost(listSPostVar)  
    postCEIVar = getPostCEI(sumSPostVar)
    insertPostCEI(postCEIVar)
    postHHIVar = getPostHHI()
    insertPostHHI(postHHIVar)
}

//Calculate pre- and post-merger CEI and HHI

//Note that calculating pre-merger CEI is easy, since we have the pre-merger critical values above
//With post-merger CEI, we need to do a new set of calculations

//Get pre-merger CEI and HHI. Pre-merger CEI = 1 - (sum of critical shares)
//Pre-merger HHI = (sum of market shares)
function getPreCEIHHI(criticalSharesList, shares) {
    sumCriticalShares = 0
    console.log(criticalSharesList)
    for (let i = 0; i < criticalSharesList.length; i++) {
        if (coordElems[i].checked) {
            sumCriticalShares += criticalSharesList[i]
        }
    }
    preCEI = 1 - sumCriticalShares

    preHHI = 0
    for (let i = 0; i < shares.length; i++) {
        preHHI += Math.pow(shares[i], 2)
    }

    return [Math.round(preCEI * 1000) / 1000, Math.round(preHHI * 1000) / 1000]
}

//Insert Pre-merger CEI and HHI into corresponding HTML location
function insertPreCEIHHI(CEIHHIList) {
    for (let i = 0; i < CEIHHIList.length; i++) {
        CEIHHIErrElems[i].innerHTML = CEIHHIList[i]
    }
    console.log(CEIHHIList)
}

//Check for mergin firms. If there are merging firms, return True
//if mKChecker is greater than 0, then merged firm is a part of K, a coordinating firm
//if mKChecker is equal to 0, then merged firm is not a part of firm, is not a coordinating firm
function mKChecker() {
    let mergerPresent = 0;
    for (let i = 0; i < mergingElems.length; i++) {
        if (mergingElems[i].checked && coordElems[i].checked) {
            mergerPresent += 1
        }
    }
    if (mergerPresent > 0) {
        console.log(mergerPresent)
        return true 
    }
    return false
}

//Create list of merged alphas, resulting in n-1 indeces
//Create two lists, one with the new merged alphas, and one with the orginal unmerged alphas
function mergedAlphasInit(alphas) {
    let listMergedAlphas = []
    let listUnmergedAlphas = []
    console.log("mergingElems: " + mergingElems)
    console.log("alphas: " + alphas)
    for (let i = 0; i < alphas.length; i++) {
        if (mergingElems[i].checked && parseFloat(alphas[i]) != 0.0) {
            listMergedAlphas.push(alphas[i])
        }
        else {
            listUnmergedAlphas.push(alphas[i])
        }
    }
    return [listMergedAlphas, listUnmergedAlphas]
}

//Get sum of merged alphas
function sumMergedAlphas(listMergedAlphas) {
    let sumMergedAlphas = 0
    console.log(listMergedAlphas)
    for (i = 0; i < listMergedAlphas.length; i++) {
        sumMergedAlphas += listMergedAlphas[i]
    }
    console.log(sumMergedAlphas)
    return sumMergedAlphas 

}

//Create a new list of alphas, including the merged alphas
function listMerAndUnmerAlphas(UnmergedList, sumMergedAlphasVar) {
    let postAlphas = UnmergedList
    postAlphas.push(sumMergedAlphasVar)
    for (i = 0; i < postAlphas.length; i++) {
        if (postAlphas[i] == 0) {
            postAlphas.splice(i, 1)
            i -= 1
        }
    }   
    console.log(postAlphas)
    return postAlphas
}

//Create listNoCheck with merged firm.
//Gets rid of merged firm from listNoCheckMerge if mKChecker == true
function listNoCheckMerge(postAlphas, mKCheckerBool) {
    let listNoCheckMerge = []
    for (i = 0; i < postAlphas.length; i++) {
        listNoCheckMerge.push(postAlphas[i])
      }
    if (mKCheckerBool == true) {
        listNoCheckMerge.splice(listNoCheckMerge.length - 1, 1)
    }
    console.log("listNoCheckMerge: " + listNoCheckMerge)
    return listNoCheckMerge
}

//Check for coordinating firms (not including the merged firm)
//If firm is coordinating and merging, inner list = [alphaValue, 1]
//If firm is coordinating and not merging, inner list = [alphaValue, 0]
function coordCheckerMerge(alphas) {
    listCoordOnly = []
    for (i = 0; i < alphas.length; i++) {
        if (coordElems[i].checked && mergingElems[i].checked == false) {
            listCoordOnly.push([alphas[i], 1])
        }
        else {
            listCoordOnly.push([alphas[i], 0])
        }
    }
    console.log("listCoordOnly: " + listCoordOnly)
    return listCoordOnly
}

//Remove alpha value from listNoCheckMerge if it exists in coordCheckerMerge
//And if its corresponding second element is 1

//THIS ISN"T WORKING
function listNC1(coordCheckerMergeVar, listNoCheckMergeVar) {
    for (i = 0; i <coordCheckerMergeVar.length; i++) {
        if (listNoCheckMergeVar.includes(coordCheckerMergeVar[i][0]) == true && coordCheckerMergeVar[i][1] == 1) {
          myIndex = listNoCheckMergeVar.indexOf(coordCheckerMergeVar[i][0])
          listNoCheckMergeVar.splice(myIndex, 1)
        }
    }
    console.log("listNoCheckMerge: " + listNoCheckMergeVar)
    return listNoCheckMergeVar
}

//Get sum of postMerger alphas
function sumPostAlphas(postAlphas) {
    let sumPostAlphas = 0
    for (let i = 0; i < postAlphas.length; i++) {
        sumPostAlphas += postAlphas[i];
    }
    console.log("sumPostAlphas: " + sumPostAlphas)
    return sumPostAlphas
}

//Get sum of listNC1
function sumNCMergeFinal(listNC1Var) {
    let sumNCMergeFinal = 0
    for (let i = 0; i < listNC1Var.length; i++) {
        sumNCMergeFinal += listNC1Var[i];
    }
    console.log("sumNCMergeFinal: " + sumNCMergeFinal)
    return sumNCMergeFinal
}

//Create a listNoCheck Clone, so we can splice it
function listNoCheckMergeClone(listNC1Var) {
    let listNoCheckMergeClone = []
    for (let i = 0; i < listNoCheckMergeVar.length; i++) {
        listNoCheckMergeClone.push(listNoCheckMergeVar[i]);
    }
    return listNoCheckMergeClone
}

//Create the FINAL list of coordinating firms post merger (thank god)
function listCheckedPostMerge(listNoCheckMergeCloneVar, postAlphas) {
    let listChecked = []
    for (let i = 0; i < postAlphas.length; i++) {
        if ((listNoCheckMergeCloneVar.includes(postAlphas[i])) === false) {
            listChecked.push(postAlphas[i])
        }
        if ((listNoCheckMergeCloneVar.includes(postAlphas[i])) === true) {
            listNoCheckMergeCloneVar.splice(listNoCheckMergeCloneVar.indexOf(postAlphas[i]), 1)
        }
    }
    console.log("listChecked: " + listChecked)
    return listChecked
}

//Now we can FINALLY begin to create our list of critical values post merger
function listSPost(listCheckedPostMergeVar, sumNCMergeFinalVar, sumPostAlphasVar, postAlphas) {
    let listSPost = []
    console.log(listCheckedPostMergeVar)
    console.log("postAlphas " + postAlphas)
    for (let i = 0; i < listCheckedPostMergeVar.length; i++) {
        
        //initialize newListNoi, identical to listNewAlphas, but missing i'th index
        let listNoiPost = []
        let freqCounter = 0
        for (let j = 0; j < postAlphas.length; j++) {            
            /*console.log("j: " + j)
            console.log("freqCounter: " + freqCounter)
            console.log("postAlphas[j]: " + postAlphas[j])
            console.log("listCheckedPostMergeVar[i]: " + listCheckedPostMergeVar[i])*/

            //Count the frequency of listCheckedPostMergeVar[i] in postAlphas
            //If listCheckedPostMergeVar[i] appears more than one in postAlphas,
            //we still push to listNoiPost even if listCheckedPostMergeVar[i] == postAlphas[j]
            if (postAlphas[j] == listCheckedPostMergeVar[i] && freqCounter > 0) {
                listNoiPost.push(postAlphas[j])
            }
            if (postAlphas[j] == listCheckedPostMergeVar[i]) {
                freqCounter += 1
            }
            if (postAlphas[j] != listCheckedPostMergeVar[i]) {
                listNoiPost.push(postAlphas[j])
            }
        }
        console.log("listNoiPost: " + listNoiPost)

        //takes the sum of newListNoi
        let sumNoiPost = 0
        for (let k = 0; k < listNoiPost.length; k++) {
            sumNoiPost += listNoiPost[k]
        }
        console.log("sumNoiPost: " + sumNoiPost)

        SiK = ((1 + listCheckedPostMergeVar[i] + sumNCMergeFinalVar) * (1 + sumNCMergeFinalVar)) / ((1 + sumNoiPost) * (1 + sumPostAlphasVar))
        listSPost.push(SiK)
    }
    console.log("listSPost: " + listSPost)
    return listSPost
}

//Insert post merger critical shares
function insertSPost(listSPostVar, criticalSharesList) {
    //Begin with inserting the unmerged critical shares, as they are the same pre-merger and post-merger
    console.log("HERE criticalSharesList: " + criticalSharesList)
    console.log("HERE HERE: " + listSPostVar);

    let roundedSPost = []
    for (let i = 0; i < listSPostVar.length; i++) {
        let curr = listSPostVar[i]
        console.log("HERE curr:" + curr)
        roundedSPost.push(Math.round(curr * 1000) / 1000)
    }
    console.log("HERE roundedSPost: " + roundedSPost)

    //Get number of unmerged coordinators
    let numUnmergedCoord = 0
    for (let i = 0; i < 10; i++) {
        if (coordElems[i].checked && !mergingElems[i].checked) {
            numUnmergedCoord++
        }
    }
    console.log("number of unmerged coordinators: " + numUnmergedCoord)

    //Iterate through and insert corresponding SiK of unmerged coordinators
    //IUM stands for inserted unmerged coordinators
    let numIUM = 0;

    for (let i = 0; i < 10; i++) {
        if (coordElems[i].checked && !mergingElems[i].checked) {
            postCritElems[i].innerHTML = roundedSPost[numIUM];
            numIUM++
        }
        if (numIUM == numUnmergedCoord) {
            break
        }
    }
    
    for (let i = 0; i < criticalSharesList.length; i++) {
        //console.log("criticalSharesList[i]" + criticalSharesList[i])
        for (let j = 0; j < roundedSPost.length; j++) {
            //console.log("roundedSPost[j]" + roundedSPost[j])
            if (parseFloat(criticalSharesList[i]) == parseFloat(roundedSPost[j])) {
                postCritElems[i].innerHTML = roundedSPost[j]
            }
        }
    }

    //Next we'll insert the post-merger critical share of the merged firm
    //Find the first checked merged firm and set their innerHTML to the merged 
    
    for (let i = 0; i < 10; i++) {
        let postSLength = listSPostVar.length
        if (coordElems[i].checked && mergingElems[i].checked) {
            let mergedElem = listSPostVar[postSLength - 1]
            roundedElem = Math.round(mergedElem * 1000) / 1000
            postCritElems[i].innerHTML = roundedElem
            break
        }
    }

    //Finally, we'll loop through the post merger SiK. Any SiK = 0 should be changed to N/A
    //Also sometimes there are post-SiK's that are displayed when they shouldn't be. When a firm is merging and not a coordinator,
    // it should not have a post-SiK
    //Also, there should be no post merger critical shares equal to 1. This occurs when all coordinators are also mergers
    console.log(postCritElems);
    for (let i = 0; i < 10; i++) {
        console.log(postCritElems[i].innerHTML)
        if (parseFloat(postCritElems[i].innerHTML) == 0.0) {
            postCritElems[i].innerHTML = "N/A"
        }
        if (!coordElems[i].checked && !mergingElems[i].checked) {
            console.log("allison gong")
            postCritElems[i].innerHTML = "N/A"
        }
        if (mergingElems[i].checked && !coordElems[i].checked) {
            console.log("kenny gong")
            postCritElems[i].innerHTML = "N/A"
        }
        if (postCritElems[i].innerHTML == 1) {
            console.log("iphone13")
            postCritElems[i].innerHTML = "N/A" 
        }
    }
    console.log(postCritElems);

        
}

//Certain scena
function numPostSCheck() {
    console.log("allison")
    for (let i = 0; i < 10; i++) {
        console.log(postCritElems[i].innerHTML)
        if (postCritElems[i].innerHTML == null) {
            postCritElems[i].innerHTML = "N/A" 
        }
    }
}

//Get sum of post merger critical shares
function sumSPost(listSPostVar) {
    let sumSPost = 0
    for (let i = 0; i < listSPostVar.length; i++) {
        sumSPost += listSPostVar[i];
    }
    console.log(sumSPost)
    return sumSPost
}

//Calculate post merger HHI
function getPostHHI() {
    console.log(mergingElems)
    let mergedShare = 0
    let shares = []
    let newShares = []
    for (let i = 0; i < shareElems.length; i++) {
        shares.push(parseFloat(shareElems[i].value))
    }
    console.log(shares)


    for (let i = 0; i < shares.length; i++) {
        if (mergingElems[i].checked) {
            console.log('true')
            mergedShare += shares[i]
        }
        else {
            newShares.push(shares[i])
        }
        console.log(newShares)
        console.log(mergedShare)
    }
    newShares.push(mergedShare)
    console.log(newShares)

    let postHHI = 0
    for (let i = 0; i < newShares.length; i++) {
        postHHI += (newShares[i] * newShares[i])
    }
    console.log(postHHI)
    return Math.round(postHHI * 1000) / 1000
}

//Calculate post merger CEI by subtracting 1 - sumSPost
function getPostCEI(sumSPostVar) {
    let postCEI = 1 - sumSPostVar
    console.log(postCEI);
    return Math.round(postCEI * 1000) / 1000
}

//Insert post merger CEI into corresponding HTML location
function insertPostCEI(postCEIVar) {
    CEIHHIErrElems[2].innerHTML = postCEIVar
}

//Insert post merger HHI into corresponding HTML location
function insertPostHHI(postHHIVar) {
    CEIHHIErrElems[3].innerHTML = postHHIVar
}

//get the PIP
function getPIPIPR(alphas) {
    twoMergeBool = checkMerge();
    if (twoMergeBool == false) {
        PIPElems[0].innerHTML = "Must have exactly two merging firms."
        OCEPIPElems[0].innerHTML = "Must have exactly two merging firms."
        IPRElems[0].innerHTML = "Must have exactly two merging firms."
        OCEIPRElems[0].innerHTML = "Must have exactly two merging firms."
    }
    else {
        let myPIP = calcPIP(alphas)
        let myCEPIP = calcCEPIP(alphas)
        insertPIP(myPIP)
        insertCEPIP(myCEPIP)
        let myIPR = calcIPR(alphas)
        //let myCEIPR = calcCEIPR(alphas)
        insertIPR(myIPR)
        

    }
}

//Check if there are only and exactly two merging entities
function checkMerge() {
    numMerge = 0;
    for (let i = 0; i < 10; i++) {
        if (mergingElems[i].checked) numMerge++;
    }
    if (numMerge == 2) return true;
    return false;

}

//calculate PIP
function calcPIP(alphas) {
    console.log(alphas);
    totAlphas = 0
    for (let i = 0; i < 10; i++) totAlphas += alphas[i];

    //This array will be of length 2, indicating the index of merging alphas in the alpha array
    let mergeAlphaIndeces = []
    for (let i = 0; i < 10; i++) {
        if (mergingElems[i].checked) mergeAlphaIndeces.push(i);
    }
    let alphaOne = alphas[mergeAlphaIndeces[0]];
    let alphaTwo = alphas[mergeAlphaIndeces[1]];
    let alphasNoOne = totAlphas - alphas[mergeAlphaIndeces[0]];
    let alphasNoTwo = totAlphas - alphas[mergeAlphaIndeces[1]];
    let alphasNoOneTwo = totAlphas - (alphas[mergeAlphaIndeces[0]] + alphas[mergeAlphaIndeces[1]]);

    myPIP = (alphaOne * alphaTwo * (totAlphas + alphasNoOneTwo)) / (alphasNoOne * alphasNoTwo * totAlphas);
    roundedPIP = Math.round(myPIP * 1000) / 1000
    console.log(roundedPIP);
    return roundedPIP
}

//Insert PIP via HTML element
function insertPIP(myPIP) {
    console.log(PIPElems)
    PIPElems[0].innerHTML = myPIP * 100 + '%'
}

//Calculate PIP w/ Cost efficiency
function calcCEPIP(alphas) {
    console.log(alphas);
    totAlphas = 0
    for (let i = 0; i < 10; i++) totAlphas += alphas[i];
    //This array will be of length 2, indicating the index of merging alphas in the alpha array
    let mergeAlphaIndeces = []
    for (let i = 0; i < 10; i++) {
        if (mergingElems[i].checked) mergeAlphaIndeces.push(i);
    }
    let alphaOne = alphas[mergeAlphaIndeces[0]];
    let alphaTwo = alphas[mergeAlphaIndeces[1]];
    let alphaNoOne = totAlphas - alphas[mergeAlphaIndeces[0]];
    let alphaNoTwo = totAlphas - alphas[mergeAlphaIndeces[1]];
    let alphaNoOneTwo = totAlphas - (alphas[mergeAlphaIndeces[0]] + alphas[mergeAlphaIndeces[1]]);

    //Create an array of the saving rates, just an array of 0.01, 0.02, ... 1.00
    let saveArr = []
    for (let i = 0; i < 100; i++) {
        saveArr.push(i * 0.01)
    }
    console.log(saveArr)

    //Initialize cost efficiency price increase probability array
    let cePIPArr = []
    for (let i = 0; i < 100; i++) {
        let cePIP = Math.pow(saveArr[i], alphaNoOneTwo) * (1 - Math.pow(saveArr[i], alphaOne)) *
            (1 - Math.pow(saveArr[i], alphaTwo)) + alphaNoOneTwo * 
            (((1 - Math.pow(saveArr[i], alphaNoOneTwo)) / alphaNoOneTwo) - 
            ((1 - Math.pow(saveArr[i], alphaNoOne)) / alphaNoOne) -
            ((1 - Math.pow(saveArr[i], alphaNoTwo)) / alphaNoTwo) + 
            ((1 - Math.pow(saveArr[i], totAlphas)) / totAlphas))
        cePIPArr.push(cePIP)
    }
    console.log(cePIPArr)

    //Get the closest PIP to 0.05

    let goal = 0.05
    var closest = cePIPArr.reduce(function(prev, curr) {
        return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
      })
    console.log(closest)

    //Find corresponding s
    let saveRate = 0; 
    for (let i = 0; i < 100; i++) {
        if (Math.round(closest * 1000) / 1000 == Math.round(cePIPArr[i] * 1000) / 1000) {
            saveRate = i
            break
        }
    }
    console.log(saveRate)
    return saveRate

}

function insertCEPIP(myCEPIP) {
    console.log(CEPIPElems)
    CEPIPElems[0].innerHTML = myCEPIP + '%'
}

//Implement Illustrative Price Increase
function calcIPR(alphas) {
    totAlphas = 0
    for (let i = 0; i < 10; i++) totAlphas += alphas[i];
    //This array will be of length 2, indicating the index of merging alphas in the alpha array
    let mergeAlphaIndeces = []
    for (let i = 0; i < 10; i++) {
        if (mergingElems[i].checked) mergeAlphaIndeces.push(i);
    }
    let alphaOne = alphas[mergeAlphaIndeces[0]];
    let alphaTwo = alphas[mergeAlphaIndeces[1]];
    let alphaNoOne = totAlphas - alphas[mergeAlphaIndeces[0]];
    let alphaNoTwo = totAlphas - alphas[mergeAlphaIndeces[1]];
    let alphaNoOneTwo = totAlphas - (alphas[mergeAlphaIndeces[0]] + alphas[mergeAlphaIndeces[1]]);

    //Consult the Merger Review Tools for Procurement Markets (Loertscher and Marx) for information about formulas.

    //num1 = topmost numerator in IPR formula.
    //num2 = second topmost numerator in IPR formula.
    
    let num1 = alphaOne * alphaTwo * (alphaOne + alphaTwo + 2 * (1 + alphaNoOneTwo))
    let num2 = (1 + alphaNoOneTwo) * (1 + alphaOne + alphaNoOneTwo) * (1 + alphaTwo + alphaNoOneTwo) * (1 + totAlphas)
    console.log(num1)
    console.log(num2)

    //For denominator, create array of alphas missing each i
    let alphasNoi = []
    for (let i = 0; i < 10; i++) {
        if (alphas[i] != 0) alphasNoi.push(totAlphas - alphas[i])
    }
    console.log(alphasNoi)

    //In the denominator, there is a summation. We'll call this summ
    let summ = 0;
    for (let i = 0; i < alphasNoi.length; i++) {
        summ += 1 / (1 + alphasNoi[i])
    }
    console.log(summ)

    //the last element is (abs(N) - 1) / (1 + AN). We'll call this lastElemIPR. Note that N = number of firms = alphasNoi.length
    let lastElemIPR = (alphasNoi.length - 1) / (1 + totAlphas)
    console.log(lastElemIPR)

    //We have all the elems needed. Just put them together!
    let ret = (num1 / num2) / (summ - lastElemIPR)
    console.log(ret)
    return ret

}

function insertIPR(myIPR) {
    IPRElems[0].innerHTML = myIPR + '%'
}

//These last few functions will be for edge cases, decimal places, etc. 

//Display if margin is in allowable range
function marginChecker(margin) {
    let share = parseFloat(shareElems[0].value)
    if (parseFloat(margin) >= 100 * (1 / (2 - (share / 100)))) {
        CEIHHIErrElems[4].innerHTML = "Margin outside of range: 1 to " +  Math.floor(100 * (1 / (2 - (share / 100))))
        for (let i = 0; i < alphaElems.length; i++) {
            alphaElems[i].innerHTML = "N/A"
        }
        for (let i = 0; i < critElems.length; i++) {
            critElems[i].innerHTML = "N/A"
        }
        for (let i = 0; i < CEIHHIErrElems.length - 1; i++) {
            CEIHHIErrElems[i].innerHTML = "N/A"
        }
    }
    else {
        console.log(CEIHHIErrElems)
        CEIHHIErrElems[4].innerHTML = "Allowable range for firm 1's margin is 1 to " +  Math.floor(100 * (1 / (2 - (share / 100))))

    }
}

//Display alphas only if market share is non-zero
function alphaDisp() {
    for (let i = 0; i < shareElems.length; i++) {
        if (shareElems[i].innerHTML == '0.0') {
            alphaElems[i].innerHTML == "N/A"
        }
    }
}

//Display critical shares only if firm is coordinating 
function coordDisp() {
    for (let i = 0; i < shareElems.length; i++) {
        if (!coordElems[i].checked) {
            critElems[i].innerHTML = 'N/A'
        }
    }
}

//Function to insert N/A into all outputs when violation occurs 
function NAInserter() {
    for (let i = 0; i < alphaElems.length; i++) {
        alphaElems[i].innerHTML = "N/A"
    }
    for (let i = 0; i < critElems.length; i++) {
        critElems[i].innerHTML = "N/A"
    }
    for (let i = 0; i < CEIHHIErrElems.length - 1; i++) {
        CEIHHIErrElems[i].innerHTML = "N/A"
    }  
}

//Check type of all inputs
function inpTypeChecker() {
    for (let i = 0; i < shareElems.length; i++) {
        if (isNaN(shareElems[i].innerHTML)) {
            CEIHHIErrElems[4].innerHTML = "Inputs must be numbers!"
            NAInserter()
        }
    }
    if (isNaN(document.getElementById("m").value)) {
        CEIHHIErrElems[4].innerHTML = "Inputs must be numbers!"
        NAInserter()
    }
}

/*

TO-DO 11-16-22:
1. Implement post-merger SiK
2. Implement refresh with submit button
3. 


*/
