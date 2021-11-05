import {Root, View, Panel, Group} from "@vkontakte/vkui";
import {useEffect, useState} from "react";
import bridge from "@vkontakte/vk-bridge";
import {WS} from "./websocket";
import {Accelerometer} from "./accelerometer";

function App() {
  const [state, setState] = useState<string | undefined>('Загрузка');
  useEffect(() => {
    (async () => {
      const ws = new WS();
      const info = await bridge.send('VKWebAppGetUserInfo');
      setState('Получили инфу о юзере!');
      const rInfo = ws.waitForResponse();
      ws.joinAsUser(info.id);
      const resp = await rInfo;
      if (resp === 0) {
        setState('Запрашиваем друзей');
        const friend = await bridge.send('VKWebAppGetFriends');
        const u = friend.users[0];
        setState('Друг выбран');
        ws.joinIntoParty(u.id);
        ws.setOtherId(u.id);
        setState('Ждём друга')
        await ws.waitForReady();
        setState('Пожалуйста, потрясите телефон');
        await Accelerometer.waitForShake();
        ws.onShake();
        await ws.waitForShake();
        setState('Вы пожали друг другу руки!');
      } else {
        ws.ready();
        setState('Пожалуйста, потрясите телефон');
        await Accelerometer.waitForShake();
        ws.onShake();
        await ws.waitForShake();
        setState('Вы пожали друг другу руки!');
      }
    })();
  }, []);
  return <Root activeView={'v1'}>
    <View activePanel={'p1'} id={'v1'}>
      <Panel id={'p1'}>
          <div className={'container'}>
            <Group>
              <h1>{state}</h1>
            </Group>
          </div>
      </Panel>
    </View>
  </Root>
}

export default App;
