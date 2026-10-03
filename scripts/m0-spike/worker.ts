self.onmessage = (event: MessageEvent<string>) => {
  if (event.data === 'ping') self.postMessage('pong');
};
