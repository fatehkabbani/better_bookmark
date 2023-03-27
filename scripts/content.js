
chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
  let bookmarksList = document.getElementById('bookmarks-list');

  bookmarkTreeNodes.forEach(function (node) {
    if (node.children) {
      // If this node has children, recursively add them to the list
      bookmarksList.appendChild(createListItem(node.title));
      addBookmarks(node.children, bookmarksList);
    } else {
      // If this node does not have children, add it to the list
      bookmarksList.appendChild(createListItem(node.title, node.url));
    }
  });
});
function addBookmarks(bookmarkNodes, parent) {
  let ul = document.createElement('ul');
  parent.appendChild(ul);

  bookmarkNodes.forEach(function (node) {
    if (node.children) {
      // If this node has children, recursively add them to the list
      ul.appendChild(createListItem(node.title));
      addBookmarks(node.children, ul);
    } else {
      // If this node does not have children, add it to the list
      ul.appendChild(createListItem(node.title, node.url));
    }
  });
}
function createListItem(title, url) {
  let li = document.createElement('li');
  let a = document.createElement('a');
  let button = document.createElement('button');
  a.href = url;
  a.textContent = title;
  button.textContent = "delete";
  li.setAttribute('class', 'bookmark-item');
  a.setAttribute('class', 'bookmark-link');
  button.setAttribute('id', 'delete')
  li.appendChild(a);
  li.appendChild(button);

  return li;
}
// get current tab 
function getCurrentTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        resolve(tabs[0]);
      } else {
        reject('No active tabs found in the last focused window.');
      }
    });
  });
}
async function getCurrentTabIndex() {
  try {
    const value = await getCurrentTab();
    const tabIndex = value.index;
    return tabIndex;
  } catch (error) {
    console.log(error)
  }
}
async function getCurrentTabUrl() {
  try {
    const value = await getCurrentTab();
    const tabUrl = value.url;
    return tabUrl;
  } catch (error) {
    console.log(error)
  }
}

async function getCurrentTabTitle() {
  try {
    const value = await getCurrentTab();
    const tabTitle = value.title
    return tabTitle

  } catch (error) {
    console.log(error)
  }
}
//Todo to override the extension page :

//! create onclick function to create a folder wehn user click
document.getElementById('create_new_bookmark').addEventListener('click', createNewBookMark)
async function createNewBookMark() {
  chrome.bookmarks.getTree(async function (bookmarkTreeNodes) {
    let bookmarkBar = bookmarkTreeNodes[0].children[0].id;

    try {
      let tabTitle = await getCurrentTabTitle();
      let tabUrl = await getCurrentTabUrl();
      chrome.bookmarks.create({
        'parentId': bookmarkBar,
        'title': tabTitle,
        'url': tabUrl
      }, function (newBookmark) {
        console.log("Added bookmark: " + newBookmark.title);
      });
    } catch (error) {
      console.log(error);
    }


  });
}
let inputToCreateAFolder = document.getElementById('input_to_create_a_folder')
document.getElementById('create_new_folder').addEventListener('click', createNewFolder)
async function createNewFolder() {
  chrome.bookmarks.getTree(async function (bookmarkTreeNodes) {
    let bookmarkBar = bookmarkTreeNodes[0].children[0].id;
    try {
      let tabTitle = await getCurrentTabTitle();
      let tabUrl = await getCurrentTabUrl();
      // Create a new folder
      chrome.bookmarks.create({
        'parentId': bookmarkBar,
        'title': inputToCreateAFolder.value
      }, function (newFolder) {
        console.log("Added folder: " + newFolder.title);
      });

    } catch (error) {
      console.log(error)
    }
  })
}
// delete bookmark 
