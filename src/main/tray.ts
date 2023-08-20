import { Tray, BrowserWindow, nativeImage } from 'electron';
import { Resvg } from '@resvg/resvg-js';

export const getTrayIcon = (progress: number) => {
  const circleRadius = 8.5;
  const circleCircumference = Math.PI * (circleRadius * 2);
  const dashLength = (circleCircumference * progress) / 100;

  return `
    <svg
      width="40"
      height="40"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17ZM12.708 10.3582L8.67954 12.7327C8.35013 12.9317 7.97268 12.7739 7.97268 12.4308V7.51018C7.97268 7.1739 8.37758 7.02979 8.67954 7.20822L12.708 9.59645C12.9962 9.76802 13.0031 10.1798 12.708 10.3582Z"
        fill="black"
      />
      <circle
        cx="10"
        cy="10"
        r="${circleRadius}"
        stroke="black"
        stroke-opacity="0.2"
      />
      <circle
        cx="10"
        cy="10"
        r="${circleRadius}"
        stroke="black"
        stroke-opacity="0.7"
        stroke-dasharray="${dashLength}, 100"
        stroke-dashoffset="0"
        transform="rotate(-90, 10, 10)"
      />
    </svg>
  `;
};

export const svgToPngNativeImage = (svg: string) => {
  const pngIcon = new Resvg(svg).render().asPng();
  const icon = nativeImage.createFromBuffer(pngIcon, { scaleFactor: 2 });
  icon.setTemplateImage(true);

  return icon;
};

export default class TrayGenerator {
  private tray: Tray | null;

  private mainWindow: BrowserWindow | null;

  private trayTitle: string;

  private trayIconType: 'idle' | 'running';

  private trayIconProgress: number;

  constructor() {
    this.tray = null;
    this.mainWindow = null;
    this.trayTitle = '';
    this.trayIconType = 'idle';
    this.trayIconProgress = 0;
  }

  private getWindowPosition = () => {
    if (!this.mainWindow || !this.tray) return undefined;

    const windowBounds = this.mainWindow.getBounds();
    const trayBounds = this.tray.getBounds();
    const x = Math.round(
      trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2
    );
    const y = Math.round(trayBounds.y + trayBounds.height);

    return { x, y };
  };

  private showWindow = () => {
    if (!this.mainWindow) return;

    const position = this.getWindowPosition();

    if (!position) return;

    this.mainWindow.setPosition(position.x, position.y, false);
    this.mainWindow.show();
    this.mainWindow.setVisibleOnAllWorkspaces(true);
    this.mainWindow.focus();
    this.mainWindow.setVisibleOnAllWorkspaces(false);
  };

  private toggleWindow = () => {
    if (!this.mainWindow) return;

    if (this.mainWindow.isVisible()) {
      this.mainWindow.hide();
    } else {
      this.showWindow();
    }
  };

  createTray = (mainWindow: BrowserWindow | null) => {
    this.mainWindow = mainWindow;
    const svgIcon = getTrayIcon(50);
    const icon = svgToPngNativeImage(svgIcon);

    this.tray = new Tray(icon);
    this.tray.setTitle('Title');
    this.tray.setIgnoreDoubleClickEvents(true);
    this.tray.on('click', this.toggleWindow);
  };
}
