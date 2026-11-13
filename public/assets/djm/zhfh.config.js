const __cfgBase = self.location.pathname.replace(/ginakj\.js$/, '')

self.__uv$config = {
	prefix: __cfgBase + 'no/',
	encodeUrl: Ultraviolet.codec.xor.encode,
	decodeUrl: Ultraviolet.codec.xor.decode,
	handler: __cfgBase + 'djm/zhfh.handler.js',
	client: __cfgBase + 'djm/zhfh.client.js',
	bundle: __cfgBase + 'djm/zhfh.bundle.js',
	config: __cfgBase + 'djm/zhfh.config.js',
	sw: __cfgBase + 'djm/zhfh.sw.js'
}
