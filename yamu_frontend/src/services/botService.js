const DIRECT_LINE_SECRET = 'AevVxFTWWkorG1Go3Bq8NU1cD7jgT5A3sFqLGivXv8OhcbxdaNQwJQQJ99BGAC24pbEAArohAAABAZBS1DkB.7g6j74dYisFDEZ3UiaboDZYsQvTqAiO3w2YvOYIzXCaM60cEbWidJQQJ99BGAC24pbEAArohAAABAZBS1gZ6';

export const getDirectLineToken = async () => {
  try {
    const response = await fetch('https://directline.botframework.com/v3/directline/tokens/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIRECT_LINE_SECRET}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin,
        'Referer': window.location.origin
      },
      body: JSON.stringify({
        user: {
          id: 'dl_' + Math.random().toString(36).substring(2, 9),
          name: 'WebChatUser'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get token: ${response.status}`);
    }

    const { token } = await response.json();
    return token;
  } catch (error) {
    console.error('Error getting DirectLine token:', error);
    throw error;
  }
};