require 'sinatra'
require 'sinatra-websocket'
require './models/users'
require 'json'

set :server, 'thin'
set :bind, '0.0.0.0'
$users = []
$to_close = []

$debug = true
$version = Time.now.to_i

get '/' do
  @debug = $debug
  if !request.websocket?
    erb :index
  else
    request.websocket do |ws|
      if $users.count > 100
        ws.onopen do |hs|
          $to_close << ws
        end
        ws.onmessage do |msg|
          # Doesn't matter...
        end
        ws.onclose do
          warn("Too busy!")
          $to_close.delete(ws)
        end
      else
        me = User.new(Array.new(12){[*"A".."F", *"0".."9"].sample}.join, ws)
        warn(me.trip + " connected...")
        ws.onopen do |hs|
          warn(hs.to_s)
          $users << me
          me.conn.send({"message" => "version", "version" => $version}.to_json)
        end
        ws.onmessage do |msg|
          # Stick fingers in your ears and do nothing - I give the orders around here!
        end
        ws.onclose do
          warn(me.trip + " websocket closed")
          $users.delete(me)
        end
      end
    end
  end
end

get '/api/:brains/?' do
  score = params[:brains].to_i.round(0)
  warn("got #{params[:brains]} -> sending to #{$users.length}")
  $users.each do |w|
    w.conn.send({"message" => "update", "brains" => score}.to_json)
  end
  "OK"
end
