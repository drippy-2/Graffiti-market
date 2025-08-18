export default function GraffitiLayer() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Graffiti Shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-graffiti-pink opacity-20 transform rotate-45 rounded-lg animate-bounce-subtle" />
      <div className="absolute top-40 right-20 w-24 h-24 bg-graffiti-green opacity-25 rounded-full" />
      <div className="absolute bottom-32 left-1/4 w-40 h-20 bg-graffiti-purple opacity-15 transform -rotate-12 rounded-lg" />
      <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-graffiti-orange opacity-20 transform rotate-12" />
      
      {/* Graffiti Text Elements */}
      <div className="absolute top-1/4 right-10 font-bangers text-6xl text-graffiti-pink opacity-10 transform rotate-12">
        SHOP
      </div>
      <div className="absolute bottom-1/3 left-10 font-bangers text-4xl text-graffiti-green opacity-15 transform -rotate-6">
        SELL
      </div>
    </div>
  );
}
