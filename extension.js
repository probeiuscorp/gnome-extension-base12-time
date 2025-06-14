import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import GObject from 'gi://GObject';
import GnomeDesktop from 'gi://GnomeDesktop';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

// TODO: custom unicode
function d2b12(digit) {
  return digit.toString(12).toUpperCase();
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
      const hours = parseInt(base10Hours);
      const minutes = parseInt(base10Minutes);
      if(isNaN(hours) || isNaN(minutes)) return false;

      const minutesRemainder = minutes % 5;
      const minutesFractional = Math.floor(minutes / 5);

      const base12 = `${d2b12(hours)}.${d2b12(minutesFractional)}\uFE62${d2b12(minutesRemainder)}`;
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
