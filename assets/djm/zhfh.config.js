const __cfgBase = self.location.pathname.replace(/ginakj\.js$/, '')
const __uvAssetBase = __cfgBase + 'assets/djm/'

self.__uv$config = {
	prefix: __cfgBase + 'no/',
	encodeUrl: Ultraviolet.codec.xor.encode,
	decodeUrl: Ultraviolet.codec.xor.decode,
	handler: __uvAssetBase + 'zhfh.handler.js',
	client: __uvAssetBase + 'zhfh.client.js',
	bundle: __uvAssetBase + 'zhfh.bundle.js',
	config: __uvAssetBase + 'zhfh.config.js',
	sw: __uvAssetBase + 'zhfh.sw.js'
}
