const bookmarksList = document.getElementById('bookmarks-list');
let inputToCreateAFolder = document.getElementById('input_to_create_a_folder');

chrome.bookmarks.getTree(async (bookmarkTreeNodes) => {
  for (const node of bookmarkTreeNodes) {
    if (node.children) {
      bookmarksList.appendChild(createListItem(node.title, node.url, node.id));
      await addBookmarks(node.children, bookmarksList);
    } else {
      bookmarksList.appendChild(createListItem(null, null, node.id));
    }
  }
});

async function addBookmarks(bookmarkNodes, parent) {
  const ul = document.createElement('ul');
  parent.appendChild(ul);

  for (const node of bookmarkNodes) {
    if (node.children) {
      ul.appendChild(createListItem(node.title));
      await addBookmarks(node.children, ul);
    } else {
      ul.appendChild(createListItem(node.title, node.url, node.id));
    }
  }
}
function createListItem(title, url, id) {
  const li = document.createElement('li');
  li.classList.add('bookmark-item');
  const a = `<a href="${url}" class="bookmark-link">${title}</a>`;
  const button = `<button id="delete" value="${id}">delete</button>`;
  li.innerHTML = `${a}${button}`;
  li.querySelector('#delete').addEventListener('click', deleteBookMark);
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

//! create onclick function to create a folder when user click
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
document.getElementById('create_new_folder').addEventListener('click', createNewFolder)
async function createNewFolder() {
  chrome.bookmarks.getTree(async function (bookmarkTreeNodes) {
    let bookmarkBar = bookmarkTreeNodes[0].children[0].id;
    try {
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
function deleteBookMark() {
  let bookmarkId = String(this.value)
  chrome.bookmarks.remove(bookmarkId)
}
//fixItNow the bookmark folder button folder return undifined 
//TODO  thing i should do in feature make the user  able to choose the folder 