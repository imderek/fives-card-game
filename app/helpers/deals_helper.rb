module DealsHelper
    def deal_status_color(status)
        case status.downcase
        when 'negotiating' then 'bg-orange-100 text-orange-700'
        when 'discovery' then 'bg-violet-100 text-violet-800'  
        when 'closed' then 'bg-green-100 text-green-800'
        when 'closing' then 'bg-blue-100 text-blue-800'
        else 'bg-gray-100 text-gray-800'
        end
    end
end
