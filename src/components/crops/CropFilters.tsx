
import React, { useState } from 'react';
import { Search, Filter, Calendar, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { GrowthStage, Zone } from '@/types';
import { CropFilter } from '@/utils/cropUtils';

interface CropFiltersProps {
  zones: Zone[];
  onFilterChange: (filters: CropFilter) => void;
}

const CropFilters: React.FC<CropFiltersProps> = ({ zones, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [growthStage, setGrowthStage] = useState<GrowthStage | ''>('');
  const [zoneId, setZoneId] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    const newActiveFilters: string[] = [];
    
    if (searchQuery) newActiveFilters.push(`Search: ${searchQuery}`);
    if (growthStage) newActiveFilters.push(`Stage: ${growthStage.charAt(0).toUpperCase() + growthStage.slice(1)}`);
    if (zoneId) {
      const zoneName = zones.find(z => z.id === zoneId)?.name || 'Unknown Zone';
      newActiveFilters.push(`Zone: ${zoneName}`);
    }
    if (startDate) newActiveFilters.push(`From: ${startDate.toLocaleDateString()}`);
    if (endDate) newActiveFilters.push(`To: ${endDate.toLocaleDateString()}`);

    setActiveFilters(newActiveFilters);
    
    onFilterChange({
      searchQuery: searchQuery || undefined,
      growthStage: growthStage as GrowthStage || undefined,
      zoneId: zoneId || undefined,
      startDate,
      endDate
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setGrowthStage('');
    setZoneId('');
    setStartDate(undefined);
    setEndDate(undefined);
    setActiveFilters([]);
    onFilterChange({});
  };

  const removeFilter = (filter: string) => {
    if (filter.startsWith('Search:')) {
      setSearchQuery('');
    } else if (filter.startsWith('Stage:')) {
      setGrowthStage('');
    } else if (filter.startsWith('Zone:')) {
      setZoneId('');
    } else if (filter.startsWith('From:')) {
      setStartDate(undefined);
    } else if (filter.startsWith('To:')) {
      setEndDate(undefined);
    }
    
    setActiveFilters(activeFilters.filter(f => f !== filter));
    
    // Reapply remaining filters
    setTimeout(() => {
      applyFilters();
    }, 0);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search crops by name or variety..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Growth Stage</h4>
                <Select value={growthStage} onValueChange={setGrowthStage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select growth stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Stages</SelectItem>
                    {Object.values(GrowthStage).map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Zone</h4>
                <Select value={zoneId} onValueChange={setZoneId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Zones</SelectItem>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Planting Date Range</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">From</p>
                    <DatePicker
                      selected={startDate}
                      onSelect={setStartDate}
                      placeholder="Start date"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">To</p>
                    <DatePicker
                      selected={endDate}
                      onSelect={setEndDate}
                      placeholder="End date"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button type="button" size="sm" onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button type="submit">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>
      
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge key={filter} variant="secondary" className="flex items-center gap-1">
              {filter}
              <button 
                onClick={() => removeFilter(filter)}
                className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
};

export default CropFilters;
