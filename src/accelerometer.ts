import bridge from "@vkontakte/vk-bridge";

export class Accelerometer {
  static async waitForShake(): Promise<void> {
    // @ts-ignore
    await bridge.send('VKWebAppAccelerometerStart', {refresh_rate: 100});

    await new Promise(resolve => {
      // @ts-ignore
      let listener = ({detail: {type, data}}) => {
        if (type === 'VKWebAppAccelerometerChanged') {
          if (Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z) >= 34) {
            resolve(null);
            bridge.unsubscribe(listener);
          }
        }
      };
      bridge.subscribe(listener);
    });
    await bridge.send('VKWebAppAccelerometerStop');
  }
}
