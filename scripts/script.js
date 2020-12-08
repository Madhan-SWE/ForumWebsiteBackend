/* declare constants */
const BACKEND_URL = "http://localhost:3000"



var topicId = '5fcf8063dc142d27a490317a'
var isLoggedIn = true
var isAdmin = true

var pageSize = 5;
var currPageNo = 0;
var maxLeft = null;
var maxRight = null;


function convertDate(dateText)
{
    let created_date = new Date(dateText);

    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let year = created_date.getFullYear();
    let month = months[created_date.getMonth()];
    let date = created_date.getDate();
    let [hour, mer] = created_date.getHours()>12?[created_date.getHours()%12, "PM"]: [created_date.getHours(), "AM"];
    let min = created_date.getMinutes();
    let sec = created_date.getSeconds();
    let time = date + ',' + month + ' ' + year + ' ' + hour + ':' + min + " " + mer;
    return time
}

function chnagePageSize(value)
{
    
    pageSize = value;
    currPageNo = 0;
    loadContent();
    
}

function changePage(item)
{
    currPageNo = item-1
    loadContent();
}

function paginate(contentData)
{
    let totalPages = Math.ceil(contentData.length/pageSize);
    console.log("===== content Length ====", contentData.length)
    console.log("Total pages: ", totalPages)
    let maxLeft = currPageNo -2;
    let maxRight = currPageNo + 2;

    let paginationBar = document.getElementById("pages");
    paginationBar.innerHTML = "";

    /* Adding previous page pointer */
    let prev = document.createElement("li");
    prev.classList.add("page-item");
    let prevLink = document.createElement("a");
    prevLink.setAttribute("onclick", "changePage(" + (currPageNo) +")" )
    prevLink.classList.add("page-link");
    prevLink.innerText = "Previous";
    prev.append(prevLink);
    paginationBar.append(prev);

    if (maxLeft < 0) {
        maxLeft = 0;
        maxRight = 4;
    }
    if(maxRight>totalPages)
    {
        maxRight = totalPages;
    }

    if(currPageNo <= 0)
    {
        prev.classList.add("disabled");
        prev.children[0].setAttribute("tab-index", "-1")
    }
    
    
    for(let i=maxLeft;i<maxRight;i++)
    {
        let btn = document.createElement("li");
        btn.classList.add("page-item");
        if(i===currPageNo)
        {
            btn.classList.add("active")
        }
        let btnLink = document.createElement("a");
        btnLink.setAttribute("onclick", "changePage(this.innerText)")
        btnLink.classList.add("page-link");
        btnLink.innerText = i+1;
        btn.append(btnLink);
        paginationBar.append(btn);
    }

    let next = document.createElement("li");
    next.classList.add("page-item");
    let nextLink = document.createElement("a");
    nextLink.setAttribute("onclick", "changePage(" + (currPageNo+2) +")" )
    nextLink.classList.add("page-link");
    nextLink.innerText = "Next";
    next.append(nextLink);
    paginationBar.append(next);

    console.log(totalPages, "-", currPageNo)
    if(currPageNo >= totalPages-1)
    {
        
        next.classList.add("disabled");
        next.children[0].setAttribute("tab-index", "-1")
    }

    let start = (currPageNo*pageSize);
    let end = (currPageNo*pageSize) + pageSize;
    end = end>contentData.length?contentData.length:end;
    return [start, end]
}


function loadContent()
{

    fetch(BACKEND_URL + "/topics/" + topicId)
    .then(res => res.json())
    .then( res => {
        
        let data = res.body; 

        //  Adding topic to the top of the page
        document.getElementById("topicSection").innerText = data.topic;
        if(res.body.discussion.length===0)
        {

        }
        let contentData = res.body.discussion;
        let [start, end] = paginate(contentData);
        console.log(start, end)

        // Creating a content section
        let i = 0;
        let reqData = res.body.discussion.slice(start, end);
        console.log(reqData);
        document.getElementById("contentSection").innerHTML = "";
        reqData.forEach(reply => {

            
            let contentRow = document.createElement("div");
            contentRow.classList.add("row");
            let contentCol = document.createElement("div");
            contentCol.classList.add("col-12");
            contentRow.append(contentCol);

            let contentDiv = document.createElement("div");
            contentDiv.classList.add("contentDiv", "shadow", "rounded", "p-3", "mb-5");

            let contentParagraph = document.createElement("p");
            contentParagraph.innerText = reply.reply;
            let contentDetailsRow = document.createElement("div");
            contentDetailsRow.classList.add("row");
            contentCol.append(contentParagraph, contentDetailsRow);

            let contentUser = document.createElement("div");
            contentUser.classList.add("col-6", "text-left", "p-2");
            contentDetailsRow.append(contentUser);

            let userNameH = document.createElement("h4");
            userNameH.innerText = reply.userName;
            let replyTime = document.createElement("p");
            replyTime = convertDate(reply.createdOn);
            contentUser.append(userNameH, replyTime);

            
            if(isLoggedIn)
            {
                let contentOps = document.createElement("div");
                contentOps.classList.add("actionButtons", "col-6", "text-right", "p-2");
                let editButton = document.createElement("button");
                editButton.classList.add("btn", "btn-primary")
                editButton.innerText = "Edit"
                contentOps.append(editButton);

                if(isAdmin)
                {
                    let deleteButton = document.createElement("button");
                    deleteButton.classList.add("btn", "btn-warning")
                    deleteButton.innerText = "Delete"
                    contentOps.append(deleteButton);
                }

                contentDetailsRow.append(contentOps);
            }
            contentDiv.append(contentRow)
            document.getElementById("contentSection").append(contentDiv)
        });
        
    });
    
}