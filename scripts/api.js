async function getApi(url) {
    try {
    const response = await fetch(url);
    if(!response.ok) {
        throw ('Problem when fetching api, the response was not ok.')
    }
    const data = await response.json();
    console.log('getApi function called!');
    return data;
    }  catch (error) {
        console.log('Error: ', error);
    }
}

export default {getApi};