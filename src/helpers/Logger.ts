import { consola } from 'consola';
import chalk from 'chalk';
import ora, { Ora } from 'ora';
import boxen from 'boxen';
import figlet from 'figlet';
import gradient from 'gradient-string';
import cliProgress from 'cli-progress';

interface LoggerConfig {
    enableAnimations?: boolean;
    showTimestamp?: boolean;
    showEmojis?: boolean;
    level?: 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'verbose';
}

class ModernLogger {
    private config: LoggerConfig;
    private activeSpinners: Map<string, Ora> = new Map();
    private progressBars: Map<string, any> = new Map();
    
    constructor(config: LoggerConfig = {}) {
        this.config = {
            enableAnimations: true,
            showTimestamp: true,
            showEmojis: true,
            level: 'info',
            ...config
        };

        // Configure consola
        consola.level = this.getConsolaLevel(this.config.level || 'info');
    }

    private getConsolaLevel(level: string): number {
        const levels = {
            silent: -1,
            error: 0,
            warn: 1,
            info: 2,
            debug: 3,
            verbose: 4
        };
        return levels[level as keyof typeof levels] || 2;
    }

    private formatTimestamp(): string {
        if (!this.config.showTimestamp) return '';
        return chalk.gray(`[${new Date().toLocaleTimeString()}]`);
    }

    // ASCII Art Banner
    showBanner(text: string): void {
        const banner = figlet.textSync(text, { font: 'ANSI Shadow' });
        const gradientBanner = gradient.rainbow(banner);
        console.log('\n' + gradientBanner + '\n');
    }

    // Boxed Messages
    showBox(message: string, title?: string): void {
        const boxOptions = {
            title,
            titleAlignment: 'center' as const,
            padding: 1,
            margin: 1,
            borderStyle: 'round' as const,
            borderColor: 'cyan',
            backgroundColor: 'black'
        };
        
        console.log(boxen(chalk.white(message), boxOptions));
    }

    // Success Messages
    success(message: string, meta?: any): void {
        const emoji = this.config.showEmojis ? '✅ ' : '';
        const timestamp = this.formatTimestamp();
        
        consola.success(
            `${timestamp} ${emoji}${chalk.green.bold(message)}`,
            meta ? chalk.gray(JSON.stringify(meta, null, 2)) : ''
        );
    }

    // Error Messages
    error(message: string, error?: Error | any): void {
        const emoji = this.config.showEmojis ? '❌ ' : '';
        const timestamp = this.formatTimestamp();
        
        if (error instanceof Error) {
            consola.error(
                `${timestamp} ${emoji}${chalk.red.bold(message)}`,
                `\n${chalk.red(error.stack || error.message)}`
            );
        } else {
            consola.error(
                `${timestamp} ${emoji}${chalk.red.bold(message)}`,
                error ? chalk.gray(JSON.stringify(error, null, 2)) : ''
            );
        }
    }

    // Warning Messages
    warn(message: string, meta?: any): void {
        const emoji = this.config.showEmojis ? '⚠️ ' : '';
        const timestamp = this.formatTimestamp();
        
        consola.warn(
            `${timestamp} ${emoji}${chalk.yellow.bold(message)}`,
            meta ? chalk.gray(JSON.stringify(meta, null, 2)) : ''
        );
    }

    // Info Messages
    info(message: string, meta?: any): void {
        const emoji = this.config.showEmojis ? 'ℹ️ ' : '';
        const timestamp = this.formatTimestamp();
        
        consola.info(
            `${timestamp} ${emoji}${chalk.blue.bold(message)}`,
            meta ? chalk.gray(JSON.stringify(meta, null, 2)) : ''
        );
    }

    // Debug Messages
    debug(message: string, meta?: any): void {
        const emoji = this.config.showEmojis ? '🔍 ' : '';
        const timestamp = this.formatTimestamp();
        
        consola.debug(
            `${timestamp} ${emoji}${chalk.magenta.bold(message)}`,
            meta ? chalk.gray(JSON.stringify(meta, null, 2)) : ''
        );
    }

    // Robot Activity Messages
    robotActivity(message: string, meta?: any): void {
        const emoji = this.config.showEmojis ? '🤖 ' : '';
        const timestamp = this.formatTimestamp();
        
        consola.info(
            `${timestamp} ${emoji}${chalk.cyan.bold(message)}`,
            meta ? chalk.gray(JSON.stringify(meta, null, 2)) : ''
        );
    }

    // Job Application Messages
    jobApplication(message: string, meta?: any): void {
        const emoji = this.config.showEmojis ? '💼 ' : '';
        const timestamp = this.formatTimestamp();
        
        consola.info(
            `${timestamp} ${emoji}${chalk.green.bold(message)}`,
            meta ? chalk.gray(JSON.stringify(meta, null, 2)) : ''
        );
    }

    // LinkedIn Activity Messages
    linkedInActivity(message: string, meta?: any): void {
        const emoji = this.config.showEmojis ? '🔗 ' : '';
        const timestamp = this.formatTimestamp();
        
        consola.info(
            `${timestamp} ${emoji}${chalk.blue.bold(message)}`,
            meta ? chalk.gray(JSON.stringify(meta, null, 2)) : ''
        );
    }

    // Question Processing Messages
    questionProcessing(message: string, meta?: any): void {
        const emoji = this.config.showEmojis ? '❓ ' : '';
        const timestamp = this.formatTimestamp();
        
        consola.info(
            `${timestamp} ${emoji}${chalk.yellow.bold(message)}`,
            meta ? chalk.gray(JSON.stringify(meta, null, 2)) : ''
        );
    }

    // AI/ChatGPT Messages
    aiActivity(message: string, meta?: any): void {
        const emoji = this.config.showEmojis ? '🧠 ' : '';
        const timestamp = this.formatTimestamp();
        
        consola.info(
            `${timestamp} ${emoji}${chalk.magenta.bold(message)}`,
            meta ? chalk.gray(JSON.stringify(meta, null, 2)) : ''
        );
    }

    // Spinner Methods
    startSpinner(id: string, text: string): void {
        if (!this.config.enableAnimations) {
            this.info(text);
            return;
        }

        const spinner = ora({
            text: chalk.cyan(text),
            color: 'cyan',
            spinner: 'dots12'
        }).start();

        this.activeSpinners.set(id, spinner);
    }

    updateSpinner(id: string, text: string): void {
        const spinner = this.activeSpinners.get(id);
        if (spinner) {
            spinner.text = chalk.cyan(text);
        }
    }

    succeedSpinner(id: string, text: string): void {
        const spinner = this.activeSpinners.get(id);
        if (spinner) {
            spinner.succeed(chalk.green(text));
            this.activeSpinners.delete(id);
        } else {
            this.success(text);
        }
    }

    failSpinner(id: string, text: string): void {
        const spinner = this.activeSpinners.get(id);
        if (spinner) {
            spinner.fail(chalk.red(text));
            this.activeSpinners.delete(id);
        } else {
            this.error(text);
        }
    }

    stopSpinner(id: string): void {
        const spinner = this.activeSpinners.get(id);
        if (spinner) {
            spinner.stop();
            this.activeSpinners.delete(id);
        }
    }

    // Progress Bar Methods
    createProgressBar(id: string, total: number, title: string): void {
        const bar = new cliProgress.SingleBar({
            format: `${chalk.cyan(title)} |${chalk.cyan('{bar}')}| {percentage}% | {value}/{total} | ETA: {eta}s`,
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true
        });

        bar.start(total, 0);
        this.progressBars.set(id, bar);
    }

    updateProgressBar(id: string, value: number): void {
        const bar = this.progressBars.get(id);
        if (bar) {
            bar.update(value);
        }
    }

    stopProgressBar(id: string): void {
        const bar = this.progressBars.get(id);
        if (bar) {
            bar.stop();
            this.progressBars.delete(id);
        }
    }

    // Separator
    separator(): void {
        console.log(chalk.gray('─'.repeat(80)));
    }

    // Rainbow text
    rainbow(text: string): void {
        console.log(gradient.rainbow(text));
    }

    // Cleanup method
    cleanup(): void {
        this.activeSpinners.forEach((spinner, id) => {
            spinner.stop();
        });
        this.activeSpinners.clear();

        this.progressBars.forEach((bar, id) => {
            bar.stop();
        });
        this.progressBars.clear();
    }
}

// Create singleton instance
export const logger = new ModernLogger({
    enableAnimations: true,
    showTimestamp: true,
    showEmojis: true,
    level: 'info'
});

// Export the class for custom instances
export { ModernLogger }; 