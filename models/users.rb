class User
  attr_reader :trip, :conn

  def initialize(trip, socket)
    @trip    = trip
    @conn    = socket
  end

end
