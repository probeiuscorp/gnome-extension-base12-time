import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import GObject from 'gi://GObject';
import GnomeDesktop from 'gi://GnomeDesktop';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

// TODO: custom unicode
function base12FromBase10(base10) {
  const number = parseInt(base10);
  return number.toString(12).toUpperCase();
}

function enable() {
  const menu = Main.panel.statusArea.dateMenu;
  const oldClock = menu._clock;
  oldClock.disconnect(menu._clockChangedId);
  const clock = new GnomeDesktop.WallClock();
  clock.bind_property('clock', menu._clockDisplay, 'text', GObject.BindingFlags.SYNC_CREATE);
  menu._clock = clock;
  function updateTime() {
    const dateTime = clock.clock;
    const succeeded = (function() {
      const timePartStart = dateTime.indexOf(String.fromCharCode(0x2002));
      if(timePartStart === -1) return false;
      const base10Time = dateTime.slice(timePartStart + 1);
      const base10TimeParts = base10Time.split(/\b/);
      if(base10TimeParts.length !== 3) return false;
      const [base10Hours, separator, base10Minutes] = base10TimeParts;
      if(isNaN(parseInt(base10Hours)) || isNaN(parseInt(base10Minutes))) return false;

      const base12Minutes = base12FromBase10(base10Minutes).padStart(2, '0');
      const base12 = `${base12FromBase10(base10Hours)}${separator}${base12Minutes}`;
      const nextText = `${dateTime.slice(0, timePartStart + 1)}${base12}`;
      menu._clockDisplay.set_text(nextText);
      return true;
    })();
  }
  menu._clockChangedId = clock.connect('notify::clock', updateTime);
  updateTime();
}

export default class Base12TimeExtension extends Extension {
  enable() {
    enable();
  }

  disable() {}
}
