import react from '@vitejs/plugin-react'
import vike from 'vike/plugin'
import path from 'path';
import { fileURLToPath } from 'url';
import findRoot from "./common/find-root.js";
import { renderPage } from 'vike/server'
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default viteMiddleware;

async function viteMiddleware(opts) {
    const ROOT_PATH = findRoot(process.cwd());
    if (!ROOT_PATH) {
        throw new Error('Couldnt find root path - no package.json found');
    }

    if (opts.dev) {
        const { createServer } = await import("vite");

        const devServer = await createServer({
            configFile: false,
            root: ROOT_PATH,
            server: {
                middlewareMode: true
            },
            plugins: [react(), vike()]
        });

        const renderPageMiddleware = (req, res, next) => {
            res.renderPage = async (ctx) => {
                const pageContextInit = {
                    urlOriginal: req.originalUrl,
                    ...ctx
                  }
                  const pageContext = await renderPage(pageContextInit)
                  const { httpResponse } = pageContext
                  if (!httpResponse) {
                    return next()
                  } else {
                    const { body, statusCode, headers, earlyHints } = httpResponse
                    if (res.writeEarlyHints) res.writeEarlyHints({ link: earlyHints.map((e) => e.earlyHintLink) })
                    headers.forEach(([name, value]) => res.setHeader(name, value))
                    res.status(statusCode)
                    // For HTTP streams use httpResponse.pipe() instead, see https://vike.dev/stream
                    res.send(body)
                  }
            }

            next();
        }
        
        return [
            devServer.middlewares,
            renderPageMiddleware
        ]
    } else {
        // IF PROD
        // TODO
    }
}